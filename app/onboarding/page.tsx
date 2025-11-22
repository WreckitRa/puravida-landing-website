"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  savePartialOnboarding,
  type PartialOnboardingData,
} from "@/lib/api";
import PhoneCodeSelector from "@/components/PhoneCodeSelector";
import CountrySelector from "@/components/CountrySelector";
import { decodeAndStoreInviteFromUrl } from "@/lib/storage";
import { initAppLinking, isAndroid, isIOS } from "@/lib/app-linking";
import {
  validateInstagramHandle,
  validatePhoneNumber,
  getInvityNumber,
} from "@/lib/validation";
import {
  createManualUser,
  type CreateManualUserResponse,
  getProducts,
  type Product,
  createSubscription,
  type CreateSubscriptionResponse,
} from "@/lib/api";
import PaymentModal from "@/components/PaymentModal";

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
  "Tech House",
  "Deep House",
  "Afro House",
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
  "Be Beach",
  "Surf Club",
  "Gate Two",
  "Iris",
  "Reunion",
  "Vnyl HiFi",
  "Soho Garden",
  "Terra Solis",
  "Pacha",
  "Moe's on the 5th",
  "Other",
];

function OnboardingPageContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const stepStartTime = useRef<number>(Date.now());
  const formStartTime = useRef<number>(Date.now());
  const [attribution, setAttribution] = useState<AttributionData>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [manualUserResponse, setManualUserResponse] =
    useState<CreateManualUserResponse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<
    string | null
  >(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaid, setHasPaid] = useState(false); // Track if user has paid for fast track
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] =
    useState(0);
  const [userCreationError, setUserCreationError] = useState<string | null>(
    null
  );
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

  // Initialize app deep linking and handle invite parameter from URL
  useEffect(() => {
    // Initialize app deep linking (for mobile app redirects)
    initAppLinking();

    // Handle invite parameter from URL (base64 encoded format: invite=base64Name|base64Phone)
    const encodedInvite = searchParams.get("invite");
    if (encodedInvite) {
      decodeAndStoreInviteFromUrl(encodedInvite);
    }

    // Handle payment success/failure
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      // Payment successful - mark as paid and navigate to success page
      setHasPaid(true);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      // Navigate to success page (step 11) to show fast track message
      setCurrentStep(11);
    } else if (paymentStatus === "cancel") {
      // Payment cancelled - stay on payment page
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  // Initialize attribution tracking on mount
  useEffect(() => {
    const attributionData = initAttribution();
    setAttribution(attributionData);

    // Log attribution for debugging (remove in production)
    if (Object.keys(attributionData).length > 0) {
      console.log("Attribution data:", attributionData);
    }
  }, []);

  // Save partial data when user leaves the page (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only save if we're past step 1 (hero screen) and have some data
      if (currentStep > 1) {
        const stepNames: Record<number, string> = {
          1: "Hero",
          2: "Personal Information",
          3: "Music Taste",
          4: "Favorite DJ",
          5: "Favorite Places",
          6: "Festivals Been To",
          7: "Festivals Want To Go",
          8: "Nightlife Frequency",
          9: "Ideal Night Out",
        };
        const stepName = stepNames[currentStep] || `Step ${currentStep}`;

        // Save partial data using fetch with keepalive for reliable delivery
        const user_id = manualUserResponse?.data?.id;
        const currentAttribution = getAttribution();
        const timeSpent = Math.floor(
          (Date.now() - stepStartTime.current) / 1000
        );

        const nameParts = formData.fullName.trim().split(/\s+/);
        const first_name = nameParts[0] || "";
        const last_name = nameParts.slice(1).join(" ") || "";
        const ageNumber = formData.age ? parseInt(formData.age, 10) : undefined;

        const partialData: PartialOnboardingData = {
          ...(user_id && { user_id }),
          ...(formData.mobile && { phone: formData.mobile }),
          ...(formData.phoneCode && { country_code: formData.phoneCode }),
          current_step: currentStep,
          step_name: stepName,
          ...(formData.fullName && {
            fullName: formData.fullName,
            first_name,
            last_name,
          }),
          ...(formData.gender && { gender: formData.gender }),
          ...(ageNumber && { age: ageNumber }),
          ...(formData.nationality && { nationality: formData.nationality }),
          ...(formData.email && { email: formData.email }),
          ...(formData.instagram && { instagram: formData.instagram }),
          ...(formData.musicTaste.length > 0 && {
            musicTaste: formData.musicTaste,
          }),
          ...(formData.musicTasteOther && {
            musicTasteOther: formData.musicTasteOther,
          }),
          ...(formData.favoriteDJ && { favoriteDJ: formData.favoriteDJ }),
          ...(formData.favoritePlacesDubai.length > 0 && {
            favoritePlacesDubai: formData.favoritePlacesDubai,
          }),
          ...(formData.favoritePlacesOther && {
            favoritePlacesOther: formData.favoritePlacesOther,
          }),
          ...(formData.festivalsBeenTo && {
            festivalsBeenTo: formData.festivalsBeenTo,
          }),
          ...(formData.festivalsWantToGo && {
            festivalsWantToGo: formData.festivalsWantToGo,
          }),
          ...(formData.nightlifeFrequency && {
            nightlifeFrequency: formData.nightlifeFrequency,
          }),
          ...(formData.idealNightOut && {
            idealNightOut: formData.idealNightOut,
          }),
          ...(Object.keys(currentAttribution).length > 0 && {
            attribution: currentAttribution,
          }),
          updated_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
        };

        // Use fetch with keepalive for reliable delivery even if page is closing
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "https://api.puravida.events";
        fetch(`${API_BASE_URL}/api/onboarding/partial`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(partialData),
          keepalive: true, // Ensures request completes even if page is closing
        }).catch(() => {
          // Silently fail - we're already leaving the page
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentStep, formData, manualUserResponse]);

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
      1: "Hero",
      2: "Personal Information",
      3: "Music Taste",
      4: "Favorite DJ",
      5: "Favorite Places",
      6: "Festivals Been To",
      7: "Festivals Want To Go",
      8: "Nightlife Frequency",
      9: "Ideal Night Out",
      10: "Emotional Lead-in",
      11: "Confirmation",
    };

    const stepName = stepNames[currentStep] || `Step ${currentStep}`;

    // Track step view
    trackStepView(currentStep, stepName);

    // Reset step timer
    stepStartTime.current = Date.now();

    // Track time spent on previous step (if not first step)
    return () => {
      if (currentStep > 1) {
        const timeSpent = (Date.now() - stepStartTime.current) / 1000;
        const prevStepName =
          stepNames[currentStep - 1] || `Step ${currentStep - 1}`;
        trackTimeOnStep(currentStep - 1, prevStepName, timeSpent);
      }
    };
  }, [currentStep]);

  // Fetch products when step 12 (payment page) is shown
  useEffect(() => {
    if (currentStep === 12 && products.length === 0 && !productsLoading) {
      const fetchProducts = async () => {
        setProductsLoading(true);
        setProductsError(null);
        const result = await getProducts(1); // 1 = production Stripe
        if (result.success && result.data) {
          setProducts(result.data);
        } else {
          setProductsError(result.error?.message || "Failed to load products");
        }
        setProductsLoading(false);
      };
      fetchProducts();
    }
  }, [currentStep, products.length, productsLoading]);

  // Handle loading messages for step 13 (checking account)
  useEffect(() => {
    if (currentStep === 13 && isCheckingAccount) {
      const loadingMessages = [
        "Checking your vibe... 🔍",
        "Analyzing your party DNA... 🧬",
        "Verifying your cool factor... ❤️",
        "Confirming you're the real deal... 💯",
        "Almost there... just double-checking... ⚡",
      ];

      // Reset to first message when loading starts
      setCurrentLoadingMessageIndex(0);

      // Change message every 800ms to ensure each message is visible
      const interval = setInterval(() => {
        setCurrentLoadingMessageIndex((prev) => {
          const next = prev + 1;
          // Stop at the last message (don't loop)
          if (next >= loadingMessages.length) {
            clearInterval(interval);
            return prev; // Stay on last message
          }
          return next;
        });
      }, 800); // Change message every 800ms

      return () => clearInterval(interval);
    }
  }, [currentStep, isCheckingAccount]);

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

  // Save partial onboarding data to database
  const savePartialData = async (stepNumber: number, stepName: string) => {
    try {
      // Get user ID from manual user response (if step 1 was completed)
      const user_id = manualUserResponse?.data?.id;

      // Get current attribution data
      const currentAttribution = getAttribution();

      // Calculate time spent
      const timeSpent = Math.floor((Date.now() - stepStartTime.current) / 1000);

      // Split name for step 1 data
      const nameParts = formData.fullName.trim().split(/\s+/);
      const first_name = nameParts[0] || "";
      const last_name = nameParts.slice(1).join(" ") || "";

      // Convert age to number if available
      const ageNumber = formData.age ? parseInt(formData.age, 10) : undefined;

      // Build partial data object with only completed fields
      const partialData: PartialOnboardingData = {
        // User identifier
        ...(user_id && { user_id }),
        ...(formData.mobile && { phone: formData.mobile }),
        ...(formData.phoneCode && { country_code: formData.phoneCode }),

        // Step tracking
        current_step: stepNumber,
        step_name: stepName,

        // Include all form data that has been filled (even if incomplete)
        ...(formData.fullName && {
          fullName: formData.fullName,
          first_name,
          last_name,
        }),
        ...(formData.gender && { gender: formData.gender }),
        ...(ageNumber && { age: ageNumber }),
        ...(formData.nationality && { nationality: formData.nationality }),
        ...(formData.email && { email: formData.email }),
        ...(formData.instagram && { instagram: formData.instagram }),
        ...(formData.musicTaste.length > 0 && {
          musicTaste: formData.musicTaste,
        }),
        ...(formData.musicTasteOther && {
          musicTasteOther: formData.musicTasteOther,
        }),
        ...(formData.favoriteDJ && { favoriteDJ: formData.favoriteDJ }),
        ...(formData.favoritePlacesDubai.length > 0 && {
          favoritePlacesDubai: formData.favoritePlacesDubai,
        }),
        ...(formData.favoritePlacesOther && {
          favoritePlacesOther: formData.favoritePlacesOther,
        }),
        ...(formData.festivalsBeenTo && {
          festivalsBeenTo: formData.festivalsBeenTo,
        }),
        ...(formData.festivalsWantToGo && {
          festivalsWantToGo: formData.festivalsWantToGo,
        }),
        ...(formData.nightlifeFrequency && {
          nightlifeFrequency: formData.nightlifeFrequency,
        }),
        ...(formData.idealNightOut && {
          idealNightOut: formData.idealNightOut,
        }),

        // Attribution (only include if we have some attribution data)
        ...(Object.keys(currentAttribution).length > 0 && {
          attribution: currentAttribution,
        }),

        // Metadata
        updated_at: new Date().toISOString(),
        time_spent_seconds: timeSpent,
      };

      // Save to database (fire and forget - don't block user flow)
      savePartialOnboarding(partialData).catch((error) => {
        // Silently fail - we don't want to interrupt user flow if save fails
        console.warn("Failed to save partial onboarding data:", error);
      });
    } catch (error) {
      // Silently fail - we don't want to interrupt user flow
      console.warn("Error preparing partial onboarding data:", error);
    }
  };

  const handleNext = async () => {
    // Step 1: Hero -> Step 2
    // Step 2: Personal info -> Step 3
    // Steps 3-9: Vibe questions (2a-2g)
    // Step 10: Emotional lead-in -> Step 11 (confirmation)
    if (currentStep < 10 && !isAnimating) {
      // Track step completion
      const stepNames: Record<number, string> = {
        1: "Hero",
        2: "Personal Information",
        3: "Music Taste",
        4: "Favorite DJ",
        5: "Favorite Places",
        6: "Festivals Been To",
        7: "Festivals Want To Go",
        8: "Nightlife Frequency",
        9: "Ideal Night Out",
      };
      const timeSpent = (Date.now() - stepStartTime.current) / 1000;
      const stepName = stepNames[currentStep] || `Step ${currentStep}`;
      trackStepComplete(currentStep, stepName, timeSpent);

      // Save partial data to database (incremental save on each step)
      // This ensures we capture data even if user abandons the flow
      savePartialData(currentStep, stepName);

      // Create user in database when completing step 2
      if (currentStep === 2) {
        setIsCreatingUser(true);
        try {
          // Split full name into first and last name
          const nameParts = formData.fullName.trim().split(/\s+/);
          const first_name = nameParts[0] || "";
          const last_name = nameParts.slice(1).join(" ") || "";

          // Clean Instagram handle (remove @ if present)
          const instagram_handle = formData.instagram.replace(/^@+/, "");

          // Convert nationality string to country_id number
          const country_id = parseInt(formData.nationality, 10);

          // Convert gender to old format ("Male" -> "1", "Female" -> "2")
          let genderValue = formData.gender;
          if (formData.gender === "Male") {
            genderValue = "1";
          } else if (formData.gender === "Female") {
            genderValue = "2";
          }

          // Get invity_number from localStorage if available
          const invity_number = getInvityNumber();

          // Create manual user
          const manualUserData = {
            first_name,
            last_name,
            phone: formData.mobile, // Just the number without country code for manual endpoint
            country_id,
            email: formData.email || undefined,
            instagram_handle,
            gender: genderValue, // Use "1" or "2" format
            invity_number: invity_number || undefined,
            source: "shortform-landing-page",
          };

          // Await and store the response to check status later
          const response = await createManualUser(manualUserData);
          setManualUserResponse(response);

          // Check if user creation failed
          if (!response.success || response.error) {
            // Parse error message to detect duplicate phone number
            const errorMessage =
              response.error?.message ||
              response.message ||
              "Failed to create user";
            let userFriendlyMessage = errorMessage;

            // Check for duplicate phone number error (handles both API error format and raw SQL errors)
            if (
              (errorMessage.includes("Duplicate entry") &&
                errorMessage.includes("users_phone_unique")) ||
              errorMessage.includes("SQLSTATE[23000]") ||
              errorMessage.includes("Integrity constraint violation") ||
              errorMessage.includes("1062")
            ) {
              userFriendlyMessage =
                "This phone number is already registered. Please use a different phone number or contact support if you believe this is an error.";
            }

            setUserCreationError(userFriendlyMessage);
            setIsCreatingUser(false);
            return; // Prevent continuing to next step
          }

          // Clear any previous errors on success
          setUserCreationError(null);
        } catch (error) {
          console.error("Error creating user:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again.";
          setUserCreationError(errorMessage);
          setIsCreatingUser(false);
          return; // Prevent continuing to next step
        } finally {
          setIsCreatingUser(false);
        }
      }

      // Only proceed to next step if user creation was successful (or not required for this step)
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    // Track form submission
    const timeToComplete = Math.floor(
      (Date.now() - formStartTime.current) / 1000
    );

    // Get latest attribution data
    const currentAttribution = getAttribution();

    // Prepare form data with attribution (matching API_SPECIFICATION.md format)
    // Convert age to number (validation ensures it's a valid integer between 21-120)
    const ageNumber = parseInt(formData.age, 10);

    // Split full name into first_name and last_name (same as createManualUser)
    const nameParts = formData.fullName.trim().split(/\s+/);
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    const submissionData: OnboardingSubmissionData = {
      fullName: formData.fullName,
      first_name,
      last_name,
      gender: formData.gender,
      age: ageNumber,
      nationality: formData.nationality,
      phone: formData.mobile || "", // Phone number WITHOUT country code
      country_code: formData.phoneCode || "", // Country code (e.g., "961" for Lebanon)
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
    setIsSubmitting(true);

    // Submit to API
    const result = await submitOnboarding(submissionData);

    if (result.success) {
      // Success
      trackFormSubmission(true, formData, timeToComplete);
      console.log("Form submitted successfully:", result);

      // Show loading/checking screen first
      setIsSubmitting(false);
      setIsCheckingAccount(true);
      setCurrentStep(13); // Loading/checking step
      setCurrentLoadingMessageIndex(0); // Reset to first message

      // Calculate delay: 5 messages × 800ms per message = 4000ms total
      // This ensures all messages are shown before transitioning
      const loadingMessages = [
        "Checking your vibe... 🔍",
        "Analyzing your party DNA... 🧬",
        "Verifying your cool factor... ❤️",
        "Confirming you're the real deal... 💯",
        "Almost there... just double-checking... ⚡",
      ];
      const messageDisplayTime = 800; // Show each message for 800ms
      const totalLoadingTime = loadingMessages.length * messageDisplayTime;

      // After showing all loading messages, transition to appropriate step
      setTimeout(() => {
        setIsCheckingAccount(false);
        // Check API response status - if "pending", show payment page, otherwise show success page
        const status = manualUserResponse?.data?.status;
        if (status === "pending") {
          setCurrentStep(12); // Review page with payment plans
        } else {
          setCurrentStep(11); // Success page with approved message
        }
        setIsAnimating(false);
      }, totalLoadingTime);
    } else {
      // API returned an error
      trackFormSubmission(false, formData, timeToComplete);
      console.error("Form submission failed:", result);

      // Show error to user
      const errorMessage = result.error?.message || "Please try again later";
      alert(`Submission failed: ${errorMessage}`);
      setIsAnimating(false);
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = () => {
    // Basic required field checks
    if (
      !formData.fullName ||
      !formData.gender ||
      !formData.age ||
      !formData.nationality ||
      !formData.phoneCode ||
      !formData.mobile ||
      !formData.instagram
    ) {
      return false;
    }

    // Validate phone number format
    const phoneValidation = validatePhoneNumber(
      formData.mobile,
      `+${formData.phoneCode}`
    );
    if (!phoneValidation.isValid) {
      return false;
    }

    // Validate Instagram handle
    const instagramValidation = validateInstagramHandle(formData.instagram);
    if (!instagramValidation.isValid) {
      return false;
    }

    // Validate age range (21-120)
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 21 || ageNum > 120) {
      return false;
    }

    return true;
  };

  const isStep2aValid = () => formData.musicTaste.length > 0;
  const isStep2bValid = () => !!formData.favoriteDJ;
  const isStep2cValid = () => formData.favoritePlacesDubai.length > 0;
  const isStep2dValid = () => !!formData.festivalsBeenTo;
  const isStep2eValid = () => !!formData.festivalsWantToGo;
  const isStep2fValid = () => !!formData.nightlifeFrequency;
  const isStep2gValid = () => true; // Optional field

  // Handle Stripe payment using backend API (matches mobile app approach)
  // Uses Payment Element for web (equivalent to Payment Sheet on mobile)
  const handleStripeCheckout = async (priceId: string) => {
    setIsProcessingPayment(true);
    try {
      // Get user ID from manual user response (user should be created in step 1)
      // Note: The API response should include 'id' field, but if it doesn't, we'll use phone as fallback
      console.log("Manual user response:", manualUserResponse);
      console.log("Current step:", currentStep);
      console.log("Response data:", manualUserResponse?.data);

      // Try to get user ID from response
      // The backend returns 'id' (can be number or UUID string)
      let userId = manualUserResponse?.data?.id;

      // If no ID, try alternative fields
      if (!userId) {
        userId =
          manualUserResponse?.data?.user_id ||
          (manualUserResponse?.data as any)?.userId;
      }

      // Convert to string if it's a number (backend might expect string)
      const userIdString = userId ? String(userId) : null;

      if (!userId) {
        // Check if user creation failed
        if (manualUserResponse && !manualUserResponse.success) {
          const errorMsg =
            manualUserResponse.error?.message ||
            manualUserResponse.message ||
            "User creation failed";
          throw new Error(
            `User creation failed: ${errorMsg}. Please go back to step 2 and try again.`
          );
        }

        // Check if we're on the right step
        if (currentStep < 2) {
          throw new Error(
            "Please complete step 2 (personal information) before selecting a payment plan."
          );
        }

        // If response exists but no ID, the backend needs to be updated
        if (
          manualUserResponse &&
          manualUserResponse.success &&
          manualUserResponse.data
        ) {
          console.error(
            "⚠️ User response exists but 'id' field is missing. Backend should return 'id' in the response."
          );
          console.error("Current response structure:", manualUserResponse.data);
          throw new Error(
            "User ID not found in API response. The backend API '/api/create-manual-user' should return 'id' in the data object. Please contact support."
          );
        }

        // Generic error - user not created yet
        throw new Error(
          "User account not found. Please complete step 2 (personal information) first, then try selecting a payment plan again."
        );
      }

      console.log("✅ Using user ID:", userId);

      // Call backend API to create subscription (matches mobile app)
      // Note: stripe_customer_id will be created automatically by backend if missing
      const subscriptionResponse = await createSubscription({
        user_id: userIdString || userId, // Use string version if available
        price_id: priceId,
      });

      if (!subscriptionResponse.success || !subscriptionResponse.data) {
        throw new Error(
          subscriptionResponse.error?.message || "Failed to create subscription"
        );
      }

      // Log full response for debugging
      console.log(
        "✅ Subscription created successfully:",
        subscriptionResponse
      );

      // Extract client_secret from response
      // API returns: { data: { client_secret: "...", payment_intent: { client_secret: "..." } } }
      const clientSecret =
        subscriptionResponse.data?.client_secret ||
        subscriptionResponse.data?.payment_intent?.client_secret ||
        (subscriptionResponse.data as any)?.payment_intent?.client_secret;

      console.log(
        "Extracted client_secret:",
        clientSecret ? "Found" : "NOT FOUND"
      );
      console.log("Response data structure:", subscriptionResponse.data);

      if (!clientSecret) {
        console.error(
          "❌ Full subscription response:",
          JSON.stringify(subscriptionResponse, null, 2)
        );
        throw new Error(
          "Payment intent client secret not found in response. Check API response structure."
        );
      }

      console.log(
        "✅ Payment intent client secret received, opening payment modal..."
      );

      // Store payment intent client secret and show payment modal
      setPaymentIntentClientSecret(clientSecret);
      setShowPaymentModal(true);
      setIsProcessingPayment(false); // Modal will handle its own loading state

      console.log(
        "✅ Modal state updated - showPaymentModal:",
        true,
        "clientSecret:",
        clientSecret.substring(0, 20) + "..."
      );
    } catch (error) {
      console.error("Payment error:", error);

      // Provide more helpful error messages
      let errorMessage = "Payment failed. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for common Stripe configuration errors
        if (
          error.message.includes("publishable") ||
          error.message.includes("key")
        ) {
          errorMessage =
            "Stripe publishable key is missing or invalid. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.";
        } else if (
          error.message.includes("price") ||
          error.message.includes("product")
        ) {
          errorMessage =
            "Product or price not found. Verify the price ID exists in Stripe Dashboard.";
        } else if (error.message.includes("User not found")) {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
      setIsProcessingPayment(false);
    }
  };

  // Format price based on currency
  const formatPrice = (amount: number, currency: string = "usd") => {
    const currencySymbols: Record<string, string> = {
      usd: "$",
      aed: "AED ",
      eur: "€",
      gbp: "£",
    };
    const symbol =
      currencySymbols[currency.toLowerCase()] || currency.toUpperCase() + " ";
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getProgress = () => {
    if (currentStep === 1) return 0; // Hero
    if (currentStep === 2) return 11; // Personal info
    if (currentStep >= 3 && currentStep <= 9) {
      // Steps 3-9 are vibe questions (7 steps), so progress from ~22% to ~78%
      const vibeProgress = ((currentStep - 2) / 8) * 67; // 67% of total (from step 2 to step 10)
      return 11 + vibeProgress;
    }
    if (currentStep === 10) return 90; // Emotional lead-in
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
  if (currentStep === 1) {
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
        {/* Payment Modal - Always render if needed */}
        {showPaymentModal && paymentIntentClientSecret && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setPaymentIntentClientSecret(null);
              setIsProcessingPayment(false);
            }}
            clientSecret={paymentIntentClientSecret}
            customerName={formData.fullName || undefined}
            onSuccess={() => {
              // Payment succeeded - mark as paid and redirect to success page
              setHasPaid(true);
              setShowPaymentModal(false);
              setPaymentIntentClientSecret(null);
              window.location.href = `${window.location.origin}/onboarding?payment=success`;
            }}
            onError={(error) => {
              // Error is already shown in modal
              console.error("Payment error:", error);
            }}
          />
        )}
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
                {/* Puravida Logo */}
                <div className="text-center animate-fade-in mb-4">
                  <img
                    src="/assets/puravida-main-logo.png"
                    alt="PuraVida"
                    className="h-12 sm:h-16 md:h-20 mx-auto object-contain"
                  />
                </div>

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
                      <div className="text-xl sm:text-2xl flex-shrink-0">
                        🎫
                      </div>
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
                      <div className="text-xl sm:text-2xl flex-shrink-0">
                        ⭐
                      </div>
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
                      <div className="text-xl sm:text-2xl flex-shrink-0">
                        🎉
                      </div>
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
                    {/* Hide button on mobile - floating bottom button serves this purpose */}
                    <button
                      onClick={() => {
                        trackButtonClick("Hero CTA", 1, "hero");
                        handleNext();
                      }}
                      className="hidden lg:block group bg-white text-black px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-bold tracking-wide hover:bg-gray-100 transition-all duration-300 rounded-2xl hover:scale-105 hover:shadow-2xl active:scale-100 relative overflow-hidden w-full"
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
                        <span>❤️</span>
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

          {/* Mobile Floating CTA Button - Always visible at bottom for high engagement */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 px-4 py-3 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <button
                onClick={() => {
                  trackButtonClick(
                    "Hero CTA Mobile Floating",
                    0,
                    "hero-mobile-floating"
                  );
                  handleNext();
                }}
                className="group bg-white text-black w-full px-6 py-4 text-base font-bold tracking-wide hover:bg-gray-100 transition-all duration-300 rounded-2xl hover:scale-105 active:scale-100 shadow-2xl relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Check Your Eligibility 🚀
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
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
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 2: Personal Information
  if (currentStep === 2) {
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
                    onChange={(e) => {
                      // Only allow integers (no decimals)
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      // Allow empty string or valid integers (allow typing intermediate values like "1" or "2" while typing "25")
                      if (value === "" || parseInt(value, 10) <= 120) {
                        updateFormData("age", value);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent decimal point, negative sign, and scientific notation
                      if (
                        e.key === "." ||
                        e.key === "-" ||
                        e.key === "e" ||
                        e.key === "E" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onBlur={(e) => {
                      // Validate on blur - ensure final value is between 21-120
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      const ageNum = parseInt(value, 10);
                      if (
                        value &&
                        (isNaN(ageNum) || ageNum < 21 || ageNum > 120)
                      ) {
                        // Reset to empty if invalid
                        updateFormData("age", "");
                      }
                    }}
                    className="w-full px-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl hover:border-gray-400 font-medium"
                    placeholder="25"
                    min="21"
                    max="120"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <CountrySelector
                    value={formData.nationality}
                    onChange={(countryId) => {
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
                    countries={countries}
                    placeholder="Select your nationality..."
                  />
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
                        // Clear error when user changes phone code
                        if (userCreationError) {
                          setUserCreationError(null);
                        }
                        // Track selection
                        trackSelection(
                          "phoneCode",
                          `+${code}`,
                          currentStep,
                          true
                        );
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
                        // Clear error when user starts editing
                        if (userCreationError) {
                          setUserCreationError(null);
                        }
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

              {userCreationError && (
                <div className="pt-2">
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-red-600 font-medium text-sm">
                      {userCreationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isStep1Valid() || isCreatingUser}
                  className={`group w-full px-8 py-5 text-lg font-bold tracking-wide transition-all duration-300 rounded-2xl relative overflow-hidden ${
                    isStep1Valid() && !isCreatingUser
                      ? "bg-black text-white hover:bg-gray-900 hover:scale-105 hover:shadow-2xl active:scale-100"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isCreatingUser ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating account...
                      </>
                    ) : isStep1Valid() ? (
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
                  {isStep1Valid() && !isCreatingUser && (
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

  // Step 3: Music Taste
  if (currentStep === 3) {
    return renderQuestionStep(
      1,
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
                  ? "bg-black text-white border-black shadow-lg scale-105"
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
            <span className="text-lg">❤️</span>
            <span>
              {formData.musicTaste.filter((g) => g !== "Other").length}{" "}
              {formData.musicTaste.filter((g) => g !== "Other").length === 1
                ? "genre"
                : "genres"}{" "}
              selected!
            </span>
          </p>
        )}
      </>,
      isStep2aValid
    );
  }

  // Step 4: Favorite DJ
  if (currentStep === 4) {
    return renderQuestionStep(
      2,
      "Who is your fav DJ 🎧",
      "Drop a name that makes you lose it",
      "🎧",
      <input
        type="text"
        value={formData.favoriteDJ}
        onChange={(e) => updateFormData("favoriteDJ", e.target.value)}
        placeholder="e.g., Black Coffee, Bedouin, Keinemusic, Marco Carola..."
        className="w-full px-6 py-5 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-2xl hover:border-gray-400 text-center text-lg font-bold"
        required
      />,
      isStep2bValid
    );
  }

  // Step 5: Favorite Places in Dubai
  if (currentStep === 5) {
    return renderQuestionStep(
      3,
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
                  ? "bg-black text-white border-black shadow-lg scale-105"
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
              {formData.favoritePlacesDubai.filter((p) => p !== "Other")
                .length === 1
                ? "place"
                : "places"}{" "}
              selected!
            </span>
          </p>
        )}
      </>,
      isStep2cValid
    );
  }

  // Step 6: Festivals Been To
  if (currentStep === 6) {
    return renderQuestionStep(
      4,
      "Festivals you've crushed 🎪",
      "Where have you been? Show off!",
      "🎡",
      <textarea
        value={formData.festivalsBeenTo}
        onChange={(e) => updateFormData("festivalsBeenTo", e.target.value)}
        rows={5}
        placeholder="e.g., Burning Man, Coachella, Tomorrowland, Ultra Music Festival, Miami Music Conference, Middle Beast, Exit Festival, Groove on the Grass, BPM, Untold..."
        className="w-full px-6 py-5 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-2xl resize-none hover:border-gray-400 text-base font-medium"
        required
      />,
      isStep2dValid
    );
  }

  // Step 7: Festivals Want To Go
  if (currentStep === 7) {
    return renderQuestionStep(
      5,
      "Festivals on your bucket list 🎯",
      "Where do you want to go next?",
      "✈️",
      <textarea
        value={formData.festivalsWantToGo}
        onChange={(e) => updateFormData("festivalsWantToGo", e.target.value)}
        rows={5}
        placeholder="e.g., Burning Man, Coachella, Tomorrowland, Ultra Music Festival, Miami Music Conference, Middle Beast, Exit Festival, Groove on the Grass, BPM, Untold..."
        className="w-full px-6 py-5 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-2xl resize-none hover:border-gray-400 text-base font-medium"
        required
      />,
      isStep2eValid
    );
  }

  // Step 8: Nightlife Frequency
  if (currentStep === 8) {
    return renderQuestionStep(
      6,
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

  // Step 9: Ideal Night Out
  if (currentStep === 9) {
    return renderQuestionStep(
      7,
      "Describe your perfect night ❤️",
      "Paint us a picture! What's the vibe? (Optional)",
      "❤️",
      <textarea
        value={formData.idealNightOut}
        onChange={(e) => updateFormData("idealNightOut", e.target.value)}
        rows={6}
        placeholder="Tell us about your perfect night... What makes it special? Who are you with? What's the vibe? Where are you? (Optional)"
        className="w-full px-6 py-5 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-2xl resize-none hover:border-gray-400 text-base font-medium"
      />,
      isStep2gValid
    );
  }

  // Step 10: Emotional Lead-in
  if (currentStep === 10) {
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
                <div className="text-7xl animate-bounce-in">❤️</div>
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
                disabled={isSubmitting}
                className={`group w-full px-12 py-6 text-xl font-bold tracking-wide transition-all duration-300 rounded-2xl relative overflow-hidden ${
                  isSubmitting
                    ? "bg-gray-600 text-white cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900 hover:scale-105 hover:shadow-2xl active:scale-100"
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </span>
                {!isSubmitting && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 13: Loading/Checking Account
  if (currentStep === 13) {
    const loadingMessages = [
      "Checking your vibe... 🔍",
      "Analyzing your party DNA... 🧬",
      "Verifying your cool factor... ❤️",
      "Confirming you're the real deal... 💯",
      "Almost there... just double-checking... ⚡",
    ];

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Animated background blobs */}
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

        <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
          {/* Loading Icon */}
          <div className="flex justify-center animate-bounce-in">
            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl animate-scale-in">
              <svg
                className="w-16 h-16 text-black animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </div>

          {/* Loading Card */}
          <div className="bg-white rounded-3xl p-10 md:p-12 shadow-2xl animate-bounce-in">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight animate-fade-in">
                We're checking your account
              </h2>
              <div className="w-32 h-1 bg-black mx-auto rounded-full"></div>
              <p className="text-2xl md:text-3xl text-gray-700 font-bold max-w-xl mx-auto min-h-[3rem] flex items-center justify-center">
                <span
                  className="animate-fade-in"
                  key={currentLoadingMessageIndex}
                >
                  {loadingMessages[currentLoadingMessageIndex]}
                </span>
              </p>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                Just making sure everything is perfect... ❤️
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 11: Confirmation (Approved or Pending)
  if (currentStep === 11) {
    const iosAppUrl = "https://apps.apple.com/us/app/id6744160016";
    const androidAppUrl =
      "https://play.google.com/store/apps/details?id=com.puravida.events";
    const whatsappNumber = "971526782867";
    const contactEmail = "hello@thisispuravida.com";
    const contactPhone = "+971 52 678 2867";

    // Check user status - if pending and hasn't paid, show pending message
    const userStatus = manualUserResponse?.data?.status;
    const isPending = userStatus === "pending" && !hasPaid;
    const isApproved = userStatus !== "pending" || hasPaid;

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
              <div className="text-7xl">{isPending ? "⏳" : "✅"}</div>
            </div>
          </div>

          {/* Success Card */}
          <div
            className="bg-white rounded-3xl p-10 md:p-12 shadow-2xl animate-bounce-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-black leading-tight animate-fade-in">
                {hasPaid
                  ? "Payment Successful! 🎉"
                  : isPending
                  ? "Application Submitted! ⏳"
                  : "Welcome to PuraVida! ❤️"}
              </h2>
              <div className="w-32 h-1 bg-black mx-auto rounded-full"></div>

              {/* Fast Track Message - Show if user paid */}
              {hasPaid && (
                <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-6 md:p-8 text-white animate-fade-in">
                  <div className="flex items-start gap-4 max-w-2xl mx-auto">
                    <div className="text-4xl flex-shrink-0">⚡</div>
                    <div className="text-left space-y-2">
                      <h3 className="text-2xl md:text-3xl font-bold">
                        Your Application is Now on Fast Track! 🚀
                      </h3>
                      <p className="text-lg md:text-xl text-gray-200">
                        Thank you for your payment! Your membership subscription
                        is now active, and our team will prioritize your
                        application for faster review. You'll hear from us
                        within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-2xl md:text-3xl text-black font-bold max-w-xl mx-auto">
                {hasPaid
                  ? "Your membership is being activated!"
                  : isPending
                  ? "Your application is under review 📋"
                  : "You're in! Add yourself to the guestlist 🎉"}
              </p>
              <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-medium">
                {hasPaid
                  ? "Your payment has been processed successfully. You'll receive your activation code shortly by WhatsApp, and your membership benefits will be available once your application is reviewed."
                  : isPending
                  ? "Thank you for submitting your application! Our team is currently reviewing it. We'll get back to you soon via WhatsApp with your activation code once your application is approved."
                  : "Your request has been approved! You'll receive your activation code shortly by WhatsApp."}
                {!isPending && (
                  <>
                    <br />
                    <span className="font-bold text-black">
                      Download the app now
                    </span>{" "}
                    to start accessing exclusive guestlists, priority bookings,
                    and curated parties at Dubai's hottest venues.
                  </>
                )}
              </p>

              {/* Fast Track Option - Show only if user is pending and hasn't paid */}
              {!hasPaid && isPending && (
                <div className="pt-6 pb-4">
                  <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-6 md:p-8 text-white">
                    <div className="flex items-start gap-4 max-w-2xl mx-auto">
                      <div className="text-4xl flex-shrink-0">⚡</div>
                      <div className="text-left space-y-4 flex-1">
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold mb-2">
                            Fast-Track Your Review
                          </h3>
                          <p className="text-lg md:text-xl text-gray-200">
                            Want to get approved faster? Subscribe to a
                            membership plan and our team will prioritize your
                            application. You'll hear from us within 24 hours!
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            trackButtonClick(
                              "Fast Track Payment",
                              10,
                              "return-to-payment"
                            );
                            setCurrentStep(11); // Go back to payment plans
                          }}
                          className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                          View Membership Plans →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* App Download Links - Only show if approved (not pending) */}
              {!isPending && (
                <div className="pt-6 space-y-4">
                  <h3 className="text-xl md:text-2xl font-bold text-black">
                    Get the App & Start Your Journey
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                      href={iosAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 bg-black text-white px-8 py-5 rounded-xl font-bold hover:bg-gray-900 transition-all duration-300 hover:scale-105 shadow-lg"
                      onClick={() =>
                        trackButtonClick("Download iOS App", 11, "app-download")
                      }
                    >
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-xs leading-tight opacity-90">
                          Download on the
                        </div>
                        <div className="text-lg leading-tight">App Store</div>
                      </div>
                    </a>
                    <a
                      href={androidAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 bg-black text-white px-8 py-5 rounded-xl font-bold hover:bg-gray-900 transition-all duration-300 hover:scale-105 shadow-lg"
                      onClick={() =>
                        trackButtonClick(
                          "Download Android App",
                          10,
                          "app-download"
                        )
                      }
                    >
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-xs leading-tight opacity-90">
                          GET IT ON
                        </div>
                        <div className="text-lg leading-tight">Google Play</div>
                      </div>
                    </a>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-base md:text-lg text-gray-700 font-medium mb-4">
                  For any problems faced, please contact our team:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-base md:text-lg">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-black hover:text-gray-700 font-bold underline transition-colors"
                    onClick={() =>
                      trackButtonClick("Contact Email", 11, "contact")
                    }
                  >
                    📧 {contactEmail}
                  </a>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:text-gray-700 font-bold underline transition-colors"
                    onClick={() =>
                      trackButtonClick("Contact WhatsApp", 11, "contact")
                    }
                  >
                    💬 {contactPhone}
                  </a>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-2 text-3xl">
                <span>🤝</span>
                <span>❤️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 12: Review Page with Payment Plans
  if (currentStep === 12) {
    // Build payment plans from API products (only male pricing)
    const paymentPlans: Array<{
      name: string;
      price: string;
      period: string;
      savings: string | null;
      popular: boolean;
      priceId: string;
      originalPrice?: string;
      percentage?: number;
    }> = [];

    // Process products to create payment plans (only male pricing)
    // Only process the first product to avoid duplicates
    if (products.length > 0) {
      const product = products[0];
      const currency = product.currency_type || "usd";

      // Monthly plan (male only) - only add if not already added
      if (
        product.monthly?.male &&
        !paymentPlans.some((p) => p.name === "Monthly")
      ) {
        const monthly = product.monthly.male;
        paymentPlans.push({
          name: "Monthly",
          price: formatPrice(monthly.amount, currency),
          period: "per month",
          savings: monthly.original_price
            ? `Save ${Math.round(
                ((parseFloat(monthly.original_price) - monthly.amount) /
                  parseFloat(monthly.original_price)) *
                  100
              )}%`
            : null,
          popular: !product.yearly?.male, // Popular if no yearly option or if monthly is the only option
          priceId: monthly.price_id,
          originalPrice: monthly.original_price,
        });
      }

      // Yearly plan (male only) - only add if not already added
      if (
        product.yearly?.male &&
        !paymentPlans.some((p) => p.name === "Annual")
      ) {
        const yearly = product.yearly.male;
        paymentPlans.push({
          name: "Annual",
          price: formatPrice(yearly.amount, currency),
          period: "per year",
          savings: yearly.percentage
            ? `Save ${yearly.percentage}%`
            : yearly.original_price
            ? `Save ${Math.round(
                ((parseFloat(yearly.original_price) - yearly.amount) /
                  parseFloat(yearly.original_price)) *
                  100
              )}%`
            : null,
          popular: true, // Yearly is usually more popular due to savings
          priceId: yearly.price_id,
          originalPrice: yearly.original_price,
          percentage: yearly.percentage,
        });
      }
    }

    // Default features
    const defaultFeatures = [
      "Full membership access",
      "Priority guest list",
      "Exclusive events",
      "24/7 concierge support",
    ];

    return (
      <>
        <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
            <div
              className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div
            className={`max-w-5xl w-full space-y-8 relative z-10 transition-all duration-700 ${
              isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            {/* Review Status Card */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl animate-bounce-in text-center">
              <div className="space-y-4 mb-8">
                <div className="text-6xl animate-bounce-in">🔍</div>
                <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
                  Your Profile is Under Review
                </h2>
                <div className="w-24 h-1 bg-black mx-auto rounded-full"></div>
                <p className="text-xl md:text-2xl text-gray-700 font-medium max-w-2xl mx-auto">
                  We're carefully reviewing your application to ensure you're
                  the perfect fit for the PuraVida community.
                </p>
              </div>

              {/* Fast Track Message */}
              <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-6 md:p-8 mb-8 text-white">
                <div className="flex items-start gap-4 max-w-3xl mx-auto">
                  <div className="text-4xl flex-shrink-0">⚡</div>
                  <div className="text-left space-y-2">
                    <h3 className="text-2xl md:text-3xl font-bold">
                      Fast-Track Your Review
                    </h3>
                    <p className="text-lg md:text-xl text-gray-200">
                      Our team prioritizes paid memberships for faster review.
                      If your application isn't accepted, we'll issue an
                      immediate full refund—no questions asked.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Plans */}
              <div className="space-y-6">
                <h3 className="text-3xl md:text-4xl font-bold text-black mb-6">
                  Choose Your Membership Plan
                </h3>

                {productsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    <p className="mt-4 text-gray-600 font-medium">
                      Loading plans...
                    </p>
                  </div>
                ) : productsError ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 font-medium mb-4">
                      {productsError}
                    </p>
                    <button
                      onClick={() => {
                        setProductsLoading(true);
                        setProductsError(null);
                        getProducts(1).then((result) => {
                          if (result.success && result.data) {
                            setProducts(result.data);
                          } else {
                            setProductsError(
                              result.error?.message || "Failed to load products"
                            );
                          }
                          setProductsLoading(false);
                        });
                      }}
                      className="text-black underline hover:text-gray-700 font-medium"
                    >
                      Try again
                    </button>
                  </div>
                ) : paymentPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 font-medium">
                      No payment plans available at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {paymentPlans.map((plan, index) => (
                      <div
                        key={`${plan.name}-${index}`}
                        className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                          plan.popular
                            ? "border-black shadow-xl scale-105"
                            : "border-gray-300"
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {plan.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full text-sm font-bold">
                            MOST POPULAR
                          </div>
                        )}
                        {plan.savings && (
                          <div className="absolute -top-3 -right-3 bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold rotate-12 shadow-lg">
                            {plan.savings}
                          </div>
                        )}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-2xl font-bold text-black mb-2">
                              {plan.name}
                            </h4>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              {plan.originalPrice && (
                                <span className="text-lg text-gray-400 line-through">
                                  {formatPrice(
                                    parseFloat(plan.originalPrice),
                                    products[0]?.currency_type || "usd"
                                  )}
                                </span>
                              )}
                              <span className="text-4xl md:text-5xl font-bold text-black">
                                {plan.price}
                              </span>
                              <span className="text-gray-600 font-medium">
                                {plan.period}
                              </span>
                            </div>
                          </div>
                          <ul className="space-y-3 text-left">
                            {defaultFeatures.map((feature, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-3 text-gray-700"
                              >
                                <span className="text-green-500 text-xl">
                                  ✓
                                </span>
                                <span className="font-medium">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <button
                            disabled={isProcessingPayment}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                              plan.popular
                                ? "bg-black text-white hover:bg-gray-900 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                : "bg-gray-100 text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                            onClick={() => {
                              trackButtonClick(
                                `Select ${plan.name} Plan`,
                                11,
                                "payment"
                              );
                              handleStripeCheckout(plan.priceId);
                            }}
                          >
                            {isProcessingPayment ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg
                                  className="animate-spin h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Processing...
                              </span>
                            ) : (
                              `Select ${plan.name} Plan`
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Refund Policy */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3 max-w-2xl mx-auto text-left">
                  <span className="text-2xl flex-shrink-0">🛡️</span>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-900">
                      Money-Back Guarantee
                    </p>
                    <p className="text-sm text-gray-600">
                      If your application isn't accepted, we'll process a full
                      refund immediately—typically within 24-48 hours. Your
                      payment is completely risk-free.
                    </p>
                  </div>
                </div>
              </div>

              {/* Skip Option */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    setCurrentStep(11);
                  }}
                  className="text-gray-500 hover:text-gray-700 font-medium text-sm underline transition-colors"
                >
                  Continue with standard review (no payment)
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Payment Modal - Render on top of payment step */}
        {showPaymentModal && paymentIntentClientSecret && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setPaymentIntentClientSecret(null);
              setIsProcessingPayment(false);
            }}
            clientSecret={paymentIntentClientSecret}
            customerName={formData.fullName || undefined}
            onSuccess={() => {
              // Payment succeeded - mark as paid and show success
              setHasPaid(true);
              setShowPaymentModal(false);
              setPaymentIntentClientSecret(null);
              // Navigate to success page with payment success
              window.location.href = `${window.location.origin}/onboarding?payment=success`;
            }}
            onError={(error) => {
              // Error is already shown in modal
              console.error("Payment error:", error);
            }}
          />
        )}
      </>
    );
  }

  return null;
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
