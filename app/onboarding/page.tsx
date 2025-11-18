"use client";

import { useState, useEffect, useRef } from "react";
import {
  trackStepView,
  trackStepComplete,
  trackButtonClick,
  trackFieldInteraction,
  trackFormSubmission,
  trackConversion,
  trackSelection,
  trackTimeOnStep,
  trackValidationError,
} from "@/lib/analytics";
import {
  initAttribution,
  getAttribution,
  type AttributionData,
} from "@/lib/attribution";
import StructuredData from "@/components/StructuredData";
import {
  submitOnboarding,
  type OnboardingSubmissionData,
  getCountries,
  type Country,
  createUser,
  type CreateUserData,
} from "@/lib/api";
import PhoneCodeSelector from "@/components/PhoneCodeSelector";

type FormData = {
  // Step 1
  fullName: string;
  gender: string;
  age: string;
  nationality: string;
  phoneCode: string;
  mobile: string;
  email: string;
  instagram: string;

  // Step 2
  musicTaste: string[];
  musicTasteOther: string;
  favoriteDJ: string;
  favoritePlacesDubai: string[];
  favoritePlacesOther: string;
  festivalsBeenTo: string;
  festivalsWantToGo: string;
  nightlifeFrequency: string;
  idealNightOut: string;
};

const MUSIC_GENRES = [
  "House",
  "Techno",
  "Hip-Hop",
  "R&B",
  "Electronic",
  "Pop",
  "Jazz",
  "Latin",
  "Afrobeats",
  "Indie",
  "Rock",
  "Other",
];

const DUBAI_PLACES = [
  "White Dubai",
  "Cavalli Club",
  "Zero Gravity",
  "Soho Garden",
  "MAD",
  "BLU",
  "Sky 2.0",
  "Sass Cafe",
  "Cirque Le Soir",
  "Base Dubai",
  "Other",
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const stepStartTime = useRef<number>(Date.now());
  const formStartTime = useRef<number>(Date.now());
  const [attribution, setAttribution] = useState<AttributionData>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    gender: "",
    age: "",
    nationality: "",
    phoneCode: "971", // Default to UAE
    mobile: "",
    email: "",
    instagram: "",
    musicTaste: [],
    musicTasteOther: "",
    favoriteDJ: "",
    favoritePlacesDubai: [],
    favoritePlacesOther: "",
    festivalsBeenTo: "",
    festivalsWantToGo: "",
    nightlifeFrequency: "",
    idealNightOut: "",
  });

  // Initialize attribution tracking on mount
  useEffect(() => {
    const attributionData = initAttribution();
    setAttribution(attributionData);

    // Log attribution for debugging (remove in production)
    if (Object.keys(attributionData).length > 0) {
      console.log("Attribution data:", attributionData);
    }
  }, []);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      const countryList = await getCountries();
      // Sort countries alphabetically by name
      const sortedCountries = [...countryList].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCountries(sortedCountries);

      // Set default phone code to UAE if available and phoneCode is still default
      setFormData((prev) => {
        if (prev.phoneCode === "971") {
          // Already set, no need to update
          return prev;
        }
        const uae = sortedCountries.find(
          (c) => c.country_code === 971 || c.country_code === "971"
        );
        if (uae) {
          return {
            ...prev,
            phoneCode: String(uae.country_code),
          };
        }
        return prev;
      });
    };
    fetchCountries();
  }, []);

  // Track step views and time spent
  useEffect(() => {
    const stepNames: Record<number, string> = {
      0: "Hero",
      1: "Personal Information",
      2: "Music Taste",
      3: "Favorite DJ",
      4: "Favorite Places",
      5: "Festivals Been To",
      6: "Festivals Want To Go",
      7: "Nightlife Frequency",
      8: "Ideal Night Out",
      9: "Emotional Lead-in",
      10: "Confirmation",
    };

    const stepName = stepNames[currentStep] || `Step ${currentStep}`;

    // Track step view
    trackStepView(currentStep, stepName);

    // Reset step timer
    stepStartTime.current = Date.now();

    // Track time spent on previous step (if not first step)
    return () => {
      if (currentStep > 0) {
        const timeSpent = (Date.now() - stepStartTime.current) / 1000;
        const prevStepName =
          stepNames[currentStep - 1] || `Step ${currentStep - 1}`;
        trackTimeOnStep(currentStep - 1, prevStepName, timeSpent);
      }
    };
  }, [currentStep]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Track field interaction
    trackFieldInteraction(field, currentStep, "change");
  };

  const toggleArrayField = (
    field: "musicTaste" | "favoritePlacesDubai",
    value: string
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      const isSelected = currentArray.includes(value);
      const newArray = isSelected
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      // Track selection
      trackSelection(field, value, currentStep, !isSelected);

      return { ...prev, [field]: newArray };
    });
  };

  const handleNext = async () => {
    // Step 0: Hero -> Step 1
    // Step 1: Personal info -> Step 2
    // Steps 2-8: Vibe questions (2a-2g)
    // Step 9: Emotional lead-in -> Step 10 (confirmation)
    if (currentStep < 9 && !isAnimating) {
      // Track step completion
      const stepNames: Record<number, string> = {
        0: "Hero",
        1: "Personal Information",
        2: "Music Taste",
        3: "Favorite DJ",
        4: "Favorite Places",
        5: "Festivals Been To",
        6: "Festivals Want To Go",
        7: "Nightlife Frequency",
        8: "Ideal Night Out",
      };
      const timeSpent = (Date.now() - stepStartTime.current) / 1000;
      const stepName = stepNames[currentStep] || `Step ${currentStep}`;
      trackStepComplete(currentStep, stepName, timeSpent);

      // Create user in database when completing step 1
      if (currentStep === 1) {
        try {
          // Split full name into first and last name
          const nameParts = formData.fullName.trim().split(/\s+/);
          const first_name = nameParts[0] || "";
          const last_name = nameParts.slice(1).join(" ") || "";

          // Combine phone code and mobile number
          const phone =
            formData.phoneCode && formData.mobile
              ? `+${formData.phoneCode}${formData.mobile}`
              : "";

          // Clean Instagram handle (remove @ if present)
          const instagram_handle = formData.instagram.replace(/^@+/, "");

          // Convert nationality string to country_id number
          const country_id = parseInt(formData.nationality, 10);

          // Prepare user data
          const userData: CreateUserData = {
            first_name,
            last_name,
            email: formData.email || undefined,
            phone,
            gender: formData.gender,
            status: 0, // 0 = pending/onboarding, adjust as needed
            country_id,
            instagram_handle,
            // image is optional, not included for now
          };

          // Create user in database
          const result = await createUser(userData);

          if (!result.success) {
            console.error("Failed to create user:", result.error);
            // Optionally show error to user, but continue with flow
            // You can uncomment the alert if you want to show errors
            // alert(`Failed to create user: ${result.error?.message || 'Please try again'}`);
          } else {
            console.log("User created successfully:", result.data);
          }
        } catch (error) {
          console.error("Error creating user:", error);
          // Continue with flow even if user creation fails
        }
      }

      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    // Track form submission
    const timeToComplete = (Date.now() - formStartTime.current) / 1000;

    // Get latest attribution data
    const currentAttribution = getAttribution();

    // Combine phone code and mobile into international format
    const mobile =
      formData.phoneCode && formData.mobile
        ? `+${formData.phoneCode}${formData.mobile}`
        : formData.mobile || "";

    // Prepare form data with attribution (matching API_SPECIFICATION.md format)
    const submissionData: OnboardingSubmissionData = {
      fullName: formData.fullName,
      gender: formData.gender,
      age: formData.age,
      nationality: formData.nationality,
      mobile: mobile, // Combined phone in international format
      email: formData.email || undefined,
      instagram: formData.instagram,
      musicTaste: formData.musicTaste,
      musicTasteOther: formData.musicTasteOther || undefined,
      favoriteDJ: formData.favoriteDJ,
      favoritePlacesDubai: formData.favoritePlacesDubai,
      favoritePlacesOther: formData.favoritePlacesOther || undefined,
      festivalsBeenTo: formData.festivalsBeenTo,
      festivalsWantToGo: formData.festivalsWantToGo,
      nightlifeFrequency: formData.nightlifeFrequency,
      idealNightOut: formData.idealNightOut,
      attribution: currentAttribution,
      submitted_at: new Date().toISOString(),
      time_to_complete_seconds: timeToComplete,
    };

    // Track conversion attempt
    trackConversion(formData, timeToComplete);

    setIsAnimating(true);

    // Submit to API
    const result = await submitOnboarding(submissionData);

    if (result.success) {
      // Success
      trackFormSubmission(true, formData, timeToComplete);
      console.log("Form submitted successfully:", result);

      setTimeout(() => {
        setCurrentStep(10);
        setIsAnimating(false);
      }, 300);
    } else {
      // API returned an error
      trackFormSubmission(false, formData, timeToComplete);
      console.error("Form submission failed:", result);

      // Show error to user
      const errorMessage = result.error?.message || "Please try again later";
      alert(`Submission failed: ${errorMessage}`);
      setIsAnimating(false);
    }
  };

  const isStep1Valid = () => {
    return (
      formData.fullName &&
      formData.gender &&
      formData.age &&
      formData.nationality &&
      formData.phoneCode &&
      formData.mobile &&
      formData.instagram
    );
  };

  const isStep2aValid = () => formData.musicTaste.length > 0;
  const isStep2bValid = () => !!formData.favoriteDJ;
  const isStep2cValid = () => formData.favoritePlacesDubai.length > 0;
  const isStep2dValid = () => !!formData.festivalsBeenTo;
  const isStep2eValid = () => !!formData.festivalsWantToGo;
  const isStep2fValid = () => !!formData.nightlifeFrequency;
  const isStep2gValid = () => !!formData.idealNightOut;

  const getProgress = () => {
    if (currentStep === 0) return 0;
    if (currentStep === 1) return 11; // Personal info
    if (currentStep >= 2 && currentStep <= 8) {
      // Steps 2-8 are vibe questions (7 steps), so progress from ~22% to ~78%
      const vibeProgress = ((currentStep - 1) / 8) * 67; // 67% of total (from step 1 to step 9)
      return 11 + vibeProgress;
    }
    if (currentStep === 9) return 90; // Emotional lead-in
    return 100; // Confirmation
  };

  const getStep1Progress = () => {
    const fields = [
      "fullName",
      "gender",
      "age",
      "nationality",
      "phoneCode",
      "mobile",
      "email",
      "instagram",
    ];
    const filled = fields.filter(
      (field) => formData[field as keyof FormData]
    ).length;
    return Math.round((filled / fields.length) * 100);
  };

  // Structured Data for SEO
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://puravida.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PuraVida",
    description:
      "Dubai's most exclusive lifestyle membership offering access to VIP guestlists, priority tables, and curated parties",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      // Add your social media profiles here
      // 'https://www.instagram.com/puravida',
      // 'https://www.facebook.com/puravida',
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Membership Inquiries",
      areaServed: "AE",
      availableLanguage: ["en", "ar"],
    },
    areaServed: {
      "@type": "City",
      name: "Dubai",
      containedIn: {
        "@type": "Country",
        name: "United Arab Emirates",
      },
    },
  };

  // Hero Section
  if (currentStep === 0) {
    // Partner logos
    const partners = [
      { logo: "/assets/logo1.svg" },
      { logo: "/assets/logo2.svg" },
      { logo: "/assets/logo3.svg" },
      { logo: "/assets/logo4.svg" },
      { logo: "/assets/logo5.svg" },
      { logo: "/assets/logo6.svg" },
    ];

    // Event creatives from API
    const eventCreatives = [
      {
        type: "video",
        src: "https://api.puravida.events/storage/event_images/JjAAlE9wi4V3fRyUQmbp10HC8AOSJKHMjT7GP862.mp4",
        alt: "Event 1",
      },
      {
        type: "video",
        src: "https://api.puravida.events/storage/event_images/eM6uZqDl8M4Mjyfy50UjXdXNbatWKhMVYOO6tbv0.mp4",
        alt: "Event 2",
      },
      {
        type: "video",
        src: "https://api.puravida.events/storage/event_images/wcmtFln4yRDWP0x2PnDBEUG7J6vo0g8w2SZ1uJsR.mp4",
        alt: "Event 3",
      },
      {
        type: "video",
        src: "https://api.puravida.events/storage/event_images/4NWUzVKk9UEBp8MIIzShM1vICMPaB8VHujciRrV8.mp4",
        alt: "Event 4",
      },
      {
        type: "video",
        src: "https://api.puravida.events/storage/event_images/tO7MurToHyhBkcxxI2JlEePn9zZWaOXijPFF9Eh9.mp4",
        alt: "Event 5",
      },
    ];

    return (
      <>
        <StructuredData data={structuredData} />
        <div className="min-h-screen bg-black relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-48 h-48 md:w-72 md:h-72 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
            <div
              className="absolute top-40 right-10 w-48 h-48 md:w-72 md:h-72 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute -bottom-8 left-1/2 w-48 h-48 md:w-72 md:h-72 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          <div
            className={`relative z-10 min-h-screen flex flex-col lg:flex-row lg:h-screen transition-all duration-500 ${
              isAnimating
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            {/* Left Section - Subscribe to the good life, Benefits, Partners */}
            <div className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-8 lg:py-8 lg:border-r border-white/10 overflow-y-auto">
              <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full space-y-4 sm:space-y-5 lg:space-y-6 py-4 sm:py-6">
                {/* Hero Title */}
                <div className="text-center animate-fade-in">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight px-2">
                    Subscribe to the
                    <br />
                    <span className="text-white">good life!</span>
                  </h2>
                </div>

                {/* Benefits Grid - Compact */}
                <div
                  className="grid grid-cols-1 gap-3 sm:gap-4 animate-fade-in"
                  style={{ animationDelay: "0.1s" }}
                >
                  {/* Guest List Benefit */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="text-xl sm:text-2xl flex-shrink-0">🎫</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                          GUEST LIST
                        </h3>
                        <p className="text-white/80 text-xs leading-relaxed mb-0.5">
                          Get yourself +1 on all guest lists
                        </p>
                        <p className="text-white/60 text-xs font-medium">
                          10+ nightclubs in Dubai
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Priority Bookings Benefit */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="text-xl sm:text-2xl flex-shrink-0">⭐</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                          PRIORITY BOOKINGS & DISCOUNTS
                        </h3>
                        <p className="text-white/80 text-xs leading-relaxed mb-0.5">
                          Enjoy priority bookings and up to 25% discounts
                        </p>
                        <p className="text-white/60 text-xs font-medium">
                          in the TOP 50 Dubai restaurants
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* After-Parties Benefit */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="text-xl sm:text-2xl flex-shrink-0">🎉</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                          AFTER-PARTIES
                        </h3>
                        <p className="text-white/80 text-xs leading-relaxed">
                          Access amazing exclusive after-parties
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partners Section - Compact */}
                <div
                  className="animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  <h3 className="text-base sm:text-lg font-bold text-white text-center mb-3 sm:mb-4">
                    Our Partners
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    {partners.map((partner, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-lg p-2 sm:p-3 hover:bg-white/10 transition-all duration-300"
                      >
                        <img
                          src={partner.logo}
                          alt={`Partner ${index + 1}`}
                          className="max-w-full max-h-full object-contain brightness-0 invert"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Eligibility CTA + Events */}
            <div className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-8 lg:py-8 overflow-y-auto">
              <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-4 sm:space-y-5 lg:space-y-6 py-4 sm:py-6">
                {/* Eligibility CTA */}
                <div className="text-center space-y-3 sm:space-y-4 animate-bounce-in">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="inline-block">
                      <span className="text-4xl sm:text-5xl">🎉</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight px-2">
                      Ready to join Dubai's
                      <br />
                      inner circle?
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-white/70 font-medium px-2">
                      Let's see if you're a fit! This takes just 2 minutes ⚡
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3 px-2">
                    <button
                      onClick={() => {
                        trackButtonClick("Hero CTA", 0, "hero");
                        handleNext();
                      }}
                      className="group bg-white text-black px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-bold tracking-wide hover:bg-gray-100 transition-all duration-300 rounded-2xl hover:scale-105 hover:shadow-2xl active:scale-100 relative overflow-hidden w-full"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Check Your Eligibility 🚀
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    </button>

                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-white/60 text-xs font-medium flex-wrap">
                      <div className="flex items-center gap-1">
                        <span>⚡</span>
                        <span>2 min</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span>🔒</span>
                        <span>Private</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span>✨</span>
                        <span>Exclusive</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto-scrolling Events - Compact */}
                <div
                  className="animate-fade-in"
                  style={{ animationDelay: "0.3s" }}
                >
                  <h3 className="text-base sm:text-lg font-bold text-white text-center mb-3 sm:mb-4">
                    Upcoming Events
                  </h3>
                  <div className="relative overflow-hidden -mx-4 sm:mx-0">
                    <div
                      className="flex gap-2 sm:gap-3 animate-scroll-horizontal"
                      style={{ width: "fit-content" }}
                    >
                      {/* First set */}
                      {eventCreatives.map((event, index) => (
                        <div
                          key={`first-${index}`}
                          className="flex-shrink-0 w-28 h-44 sm:w-32 sm:h-52 md:w-36 md:h-60 bg-white/5 border border-white/10 rounded-lg overflow-hidden"
                        >
                          {event.type === "video" ? (
                            <video
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                            >
                              <source src={event.src} type="video/mp4" />
                              {/* Fallback */}
                              <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white/60 text-xs">
                                {event.alt}
                              </div>
                            </video>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white/60 text-xs">
                              {event.alt}
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Duplicate for seamless loop */}
                      {eventCreatives.map((event, index) => (
                        <div
                          key={`second-${index}`}
                          className="flex-shrink-0 w-28 h-44 sm:w-32 sm:h-52 md:w-36 md:h-60 bg-white/5 border border-white/10 rounded-lg overflow-hidden"
                        >
                          {event.type === "video" ? (
                            <video
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                            >
                              <source src={event.src} type="video/mp4" />
                              {/* Fallback */}
                              <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white/60 text-xs">
                                {event.alt}
                              </div>
                            </video>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white/60 text-xs">
                              {event.alt}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 1: Personal Information
  if (currentStep === 1) {
    const progress = getStep1Progress();
    return (
      <div className="min-h-screen bg-black flex items-start justify-center px-4 py-8 md:py-16 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full filter blur-2xl animate-pulse-slow"></div>
          <div
            className="absolute bottom-10 left-10 w-64 h-64 bg-white/5 rounded-full filter blur-2xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div
          className={`max-w-2xl w-full space-y-8 relative z-10 transition-all duration-500 ${
            isAnimating
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
        >
          {/* Progress Bar */}
          <div className="space-y-3 animate-slide-in-right">
            <div className="flex items-center justify-between text-sm font-bold text-white/90">
              <span>Question 1 of 9</span>
              <span>{Math.round(getProgress())}% done</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-white transition-all duration-500 ease-out rounded-full shadow-lg"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl animate-bounce-in">
            <div className="space-y-6 text-center mb-8">
              <div className="text-6xl animate-bounce-in">👋</div>
              <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">
                Let's get to know you!
              </h2>
              <p className="text-lg text-gray-600 font-medium">
                Quick intro - we promise it's painless 😊
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!isStep1Valid()) {
                  trackValidationError(
                    currentStep,
                    "form",
                    "incomplete_fields"
                  );
                  return;
                }
                trackButtonClick("Continue", currentStep, "form-submit");
                handleNext();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    onFocus={() =>
                      trackFieldInteraction("fullName", currentStep, "focus")
                    }
                    onBlur={() =>
                      trackFieldInteraction("fullName", currentStep, "blur")
                    }
                    className="w-full px-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl hover:border-gray-400 font-medium"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateFormData("gender", e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl hover:border-gray-400 cursor-pointer font-medium"
                    required
                  >
                    <option value="">Choose...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData("age", e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl hover:border-gray-400 font-medium"
                    placeholder="25"
                    min="18"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => {
                      const countryId = e.target.value;
                      updateFormData("nationality", countryId);
                      // Track selection
                      if (countryId && countries.length > 0) {
                        const country = countries.find(
                          (c) => c.id.toString() === countryId
                        );
                        if (country) {
                          trackSelection(
                            "nationality",
                            country.name,
                            currentStep,
                            true
                          );
                        }
                      }
                    }}
                    onFocus={() =>
                      trackFieldInteraction("nationality", currentStep, "focus")
                    }
                    onBlur={() =>
                      trackFieldInteraction("nationality", currentStep, "blur")
                    }
                    className="w-full px-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl hover:border-gray-400 cursor-pointer font-medium"
                    required
                  >
                    <option value="">Select your nationality...</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id.toString()}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <PhoneCodeSelector
                      value={formData.phoneCode || "971"}
                      onChange={(code) => {
                        updateFormData("phoneCode", code);
                        // Track selection
                        trackSelection("phoneCode", `+${code}`, currentStep, true);
                      }}
                      onFocus={() =>
                        trackFieldInteraction("phoneCode", currentStep, "focus")
                      }
                      onBlur={() =>
                        trackFieldInteraction("phoneCode", currentStep, "blur")
                      }
                      className="w-auto"
                    />
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, "");
                        updateFormData("mobile", value);
                      }}
                      onFocus={() =>
                        trackFieldInteraction("mobile", currentStep, "focus")
                      }
                      onBlur={() =>
                        trackFieldInteraction("mobile", currentStep, "blur")
                      }
                      className="flex-1 px-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl hover:border-gray-400 font-medium"
                      placeholder="501234567"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  {formData.phoneCode && formData.mobile && (
                    <p className="text-xs text-gray-500 mt-1">
                      +{formData.phoneCode} {formData.mobile}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    onFocus={() =>
                      trackFieldInteraction("email", currentStep, "focus")
                    }
                    onBlur={() =>
                      trackFieldInteraction("email", currentStep, "blur")
                    }
                    className="w-full px-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl hover:border-gray-400 font-medium"
                    placeholder="you@example.com (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Instagram Handle <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    @
                  </span>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) =>
                      updateFormData(
                        "instagram",
                        e.target.value.replace("@", "")
                      )
                    }
                    className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl hover:border-gray-400 font-medium"
                    placeholder="username"
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isStep1Valid()}
                  className={`group w-full px-8 py-5 text-lg font-bold tracking-wide transition-all duration-300 rounded-2xl relative overflow-hidden ${
                    isStep1Valid()
                      ? "bg-black text-white hover:bg-gray-900 hover:scale-105 hover:shadow-2xl active:scale-100"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isStep1Valid() ? (
                      <>
                        Continue 🎯
                        <svg
                          className="w-6 h-6 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    ) : (
                      "Fill all fields to continue"
                    )}
                  </span>
                  {isStep1Valid() && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to render a single question step
  const renderQuestionStep = (
    stepNumber: number,
    title: string,
    subtitle: string,
    emoji: string,
    children: React.ReactNode,
    isValid: () => boolean
  ) => {
    const progress = getProgress();

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full filter blur-2xl animate-pulse-slow"></div>
          <div
            className="absolute bottom-10 left-10 w-64 h-64 bg-white/5 rounded-full filter blur-2xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div
          className={`max-w-2xl w-full space-y-8 relative z-10 transition-all duration-500 ${
            isAnimating
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
        >
          {/* Progress Bar - Duolingo style */}
          <div className="space-y-3 animate-slide-in-right">
            <div className="flex items-center justify-between text-sm font-bold text-white/90">
              <span>Question {stepNumber} of 9</span>
              <span>{Math.round(progress)}% done</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-white transition-all duration-500 ease-out rounded-full shadow-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl animate-bounce-in">
            <div className="space-y-6 text-center mb-8">
              <div
                className="text-6xl animate-bounce-in"
                style={{ animationDelay: "0.1s" }}
              >
                {emoji}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">
                {title}
              </h2>
              <p className="text-lg text-gray-600 font-medium">{subtitle}</p>
            </div>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (!isValid()) {
                  trackValidationError(stepNumber, "form", "incomplete_fields");
                  return;
                }
                trackButtonClick("Continue", stepNumber, "form-submit");
                handleNext();
              }}
            >
              <div
                className="animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                {children}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isValid()}
                  className={`group w-full px-8 py-5 text-lg font-bold tracking-wide transition-all duration-300 rounded-2xl relative overflow-hidden ${
                    isValid()
                      ? "bg-black text-white hover:bg-gray-900 hover:scale-105 hover:shadow-2xl active:scale-100"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isValid() ? (
                      <>
                        Continue 🎯
                        <svg
                          className="w-6 h-6 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    ) : (
                      "Answer to continue"
                    )}
                  </span>
                  {isValid() && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Step 2: Music Taste
  if (currentStep === 2) {
    return renderQuestionStep(
      2,
      "What gets you moving? 🎵",
      "Tap all your favorite genres",
      "🎧",
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MUSIC_GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => {
                if (genre === "Other") {
                  toggleArrayField("musicTaste", genre);
                } else {
                  toggleArrayField("musicTaste", genre);
                  if (formData.musicTaste.includes(genre)) {
                    updateFormData("musicTasteOther", "");
                  }
                }
              }}
              className={`px-4 py-4 text-sm font-bold border-2 transition-all duration-200 rounded-xl transform hover:scale-110 active:scale-95 ${
                formData.musicTaste.includes(genre)
                  ? "bg-white text-black border-black shadow-lg scale-105"
                  : "bg-white text-black border-gray-300 hover:border-black hover:shadow-md"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        {formData.musicTaste.includes("Other") && (
          <input
            type="text"
            value={formData.musicTasteOther}
            onChange={(e) => updateFormData("musicTasteOther", e.target.value)}
            placeholder="What else? 🎶"
            className="w-full mt-3 px-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl font-medium"
          />
        )}
        {formData.musicTaste.filter((g) => g !== "Other").length > 0 && (
          <p className="text-sm text-black font-bold flex items-center justify-center gap-2 animate-bounce-in">
            <span className="text-lg">✨</span>
            <span>
              {formData.musicTaste.filter((g) => g !== "Other").length} genres
              selected!
            </span>
          </p>
        )}
      </>,
      isStep2aValid
    );
  }

  // Step 3: Favorite DJ
  if (currentStep === 3) {
    return renderQuestionStep(
      3,
      "Who's your DJ crush? 🎧",
      "Drop a name that makes you lose it",
      "🎹",
      <input
        type="text"
        value={formData.favoriteDJ}
        onChange={(e) => updateFormData("favoriteDJ", e.target.value)}
        placeholder="e.g., David Guetta, Amelie Lens, Black Coffee..."
        className="w-full px-6 py-5 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-2xl hover:border-gray-400 text-center text-lg font-bold"
        required
      />,
      isStep2bValid
    );
  }

  // Step 4: Favorite Places in Dubai
  if (currentStep === 4) {
    return renderQuestionStep(
      4,
      "Where do you party in Dubai? 🏙️",
      "Tap all your favorite spots",
      "🌃",
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DUBAI_PLACES.map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => {
                if (place === "Other") {
                  toggleArrayField("favoritePlacesDubai", place);
                } else {
                  toggleArrayField("favoritePlacesDubai", place);
                  if (formData.favoritePlacesDubai.includes(place)) {
                    updateFormData("favoritePlacesOther", "");
                  }
                }
              }}
              className={`px-4 py-4 text-sm font-bold border-2 transition-all duration-200 rounded-xl transform hover:scale-110 active:scale-95 ${
                formData.favoritePlacesDubai.includes(place)
                  ? "bg-white text-black border-black shadow-lg scale-105"
                  : "bg-white text-black border-gray-300 hover:border-black hover:shadow-md"
              }`}
            >
              {place}
            </button>
          ))}
        </div>
        {formData.favoritePlacesDubai.includes("Other") && (
          <input
            type="text"
            value={formData.favoritePlacesOther}
            onChange={(e) =>
              updateFormData("favoritePlacesOther", e.target.value)
            }
            placeholder="What's the spot? 🎉"
            className="w-full mt-3 px-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl font-medium"
          />
        )}
        {formData.favoritePlacesDubai.filter((p) => p !== "Other").length >
          0 && (
          <p className="text-sm text-black font-bold flex items-center justify-center gap-2 animate-bounce-in">
            <span className="text-lg">🔥</span>
            <span>
              {formData.favoritePlacesDubai.filter((p) => p !== "Other").length}{" "}
              places selected!
            </span>
          </p>
        )}
      </>,
      isStep2cValid
    );
  }

  // Step 5: Festivals Been To
  if (currentStep === 5) {
    return renderQuestionStep(
      5,
      "Festivals you've crushed 🎪",
      "Where have you been? Show off!",
      "🎡",
      <textarea
        value={formData.festivalsBeenTo}
        onChange={(e) => updateFormData("festivalsBeenTo", e.target.value)}
        rows={5}
        placeholder="e.g., Coachella 2023, Tomorrowland, Ultra Miami, Burning Man..."
        className="w-full px-6 py-5 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-2xl resize-none hover:border-gray-400 text-base font-medium"
        required
      />,
      isStep2dValid
    );
  }

  // Step 6: Festivals Want To Go
  if (currentStep === 6) {
    return renderQuestionStep(
      6,
      "Festivals on your bucket list 🎯",
      "Where do you want to go next?",
      "✈️",
      <textarea
        value={formData.festivalsWantToGo}
        onChange={(e) => updateFormData("festivalsWantToGo", e.target.value)}
        rows={5}
        placeholder="e.g., Burning Man, Glastonbury, EDC Las Vegas, Sziget..."
        className="w-full px-6 py-5 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-2xl resize-none hover:border-gray-400 text-base font-medium"
        required
      />,
      isStep2eValid
    );
  }

  // Step 7: Nightlife Frequency
  if (currentStep === 7) {
    return renderQuestionStep(
      7,
      "How often do you go out? 🌙",
      "Be honest! We're all friends here",
      "🌆",
      <select
        value={formData.nightlifeFrequency}
        onChange={(e) => updateFormData("nightlifeFrequency", e.target.value)}
        className="w-full px-6 py-5 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-2xl hover:border-gray-400 cursor-pointer text-center text-lg font-bold"
        required
      >
        <option value="">Choose your vibe...</option>
        <option value="daily">Daily 🔥</option>
        <option value="few-times-week">A few times a week</option>
        <option value="weekly">Weekly</option>
        <option value="few-times-month">A few times a month</option>
        <option value="monthly">Monthly</option>
        <option value="rarely">Rarely</option>
      </select>,
      isStep2fValid
    );
  }

  // Step 8: Ideal Night Out
  if (currentStep === 8) {
    return renderQuestionStep(
      8,
      "Describe your perfect night 🌟",
      "Paint us a picture! What's the vibe?",
      "✨",
      <textarea
        value={formData.idealNightOut}
        onChange={(e) => updateFormData("idealNightOut", e.target.value)}
        rows={6}
        placeholder="Tell us about your perfect night... What makes it special? Who are you with? What's the vibe? Where are you?"
        className="w-full px-6 py-5 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-2xl resize-none hover:border-gray-400 text-base font-medium"
        required
      />,
      isStep2gValid
    );
  }

  // Step 9: Emotional Lead-in
  if (currentStep === 9) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div
          className={`max-w-3xl w-full space-y-10 text-center relative z-10 transition-all duration-500 ${
            isAnimating
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
        >
          {/* Progress Bar */}
          <div className="space-y-3 animate-slide-in-right">
            <div className="flex items-center justify-between text-sm font-bold text-white/90">
              <span>Almost there! 🎉</span>
              <span>90% done</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-white transition-all duration-500 ease-out rounded-full shadow-lg"
                style={{ width: "90%" }}
              ></div>
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-3xl p-10 md:p-12 shadow-2xl animate-bounce-in">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-7xl animate-bounce-in">✨</div>
                <h2 className="text-5xl md:text-6xl font-bold text-black leading-tight">
                  Welcome to PuraVida
                </h2>
                <div className="w-32 h-1 bg-black mx-auto rounded-full"></div>
              </div>

              <div className="space-y-6 text-gray-700 leading-relaxed max-w-2xl mx-auto">
                <p className="text-2xl md:text-3xl font-bold text-black">
                  More than a membership—it's your key to Dubai's inner circle
                  🗝️
                </p>
                <p className="text-lg md:text-xl text-gray-600 font-medium">
                  Exclusive guestlists, priority tables, and curated parties at
                  Dubai's hottest venues.
                </p>
                <p className="text-base md:text-lg text-gray-600 italic font-medium">
                  For people who live well and move in the right circles.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => {
                  trackButtonClick("Submit & Check Eligibility", 9, "lead-in");
                  handleSubmit();
                }}
                className="group w-full bg-black text-white px-12 py-6 text-xl font-bold tracking-wide hover:bg-gray-900 transition-all duration-300 rounded-2xl hover:scale-105 hover:shadow-2xl active:scale-100 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Submit & Check Eligibility 🚀
                  <svg
                    className="w-7 h-7 transition-transform group-hover:translate-x-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 10: Confirmation
  if (currentStep === 10) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
        {/* Celebration confetti effect */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-30 animate-pulse-slow"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div
          className={`max-w-3xl w-full text-center space-y-8 relative z-10 transition-all duration-700 ${
            isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          {/* Success Icon */}
          <div className="flex justify-center animate-bounce-in">
            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl animate-scale-in">
              <div className="text-7xl">🎉</div>
            </div>
          </div>

          {/* Success Card */}
          <div
            className="bg-white rounded-3xl p-10 md:p-12 shadow-2xl animate-bounce-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-black leading-tight animate-fade-in">
                You're in! 🎊
              </h2>
              <div className="w-32 h-1 bg-black mx-auto rounded-full"></div>
              <p className="text-2xl md:text-3xl text-black font-bold max-w-xl mx-auto">
                Our concierge will reach out within 24 hours
              </p>
              <p className="text-lg text-gray-600 max-w-md mx-auto font-medium">
                Thanks for sharing your vibe with us! We're stoked to welcome
                you to the PuraVida family. Get ready for an epic experience! 🔥
              </p>

              <div className="pt-4 flex items-center justify-center gap-2 text-2xl">
                <span>✨</span>
                <span>🌟</span>
                <span>💫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
