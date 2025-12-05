"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackPageView, trackEvent, trackButtonClick } from "@/lib/analytics";
import PhoneCodeSelector from "@/components/PhoneCodeSelector";
import Header from "@/components/Header";
import { registerToGuestlist, type EventDetails } from "@/lib/api";
import { redirectToAppStore, isAndroid, isIOS } from "@/lib/app-linking";

// Static event data - no API fetching
const EVENT_DATA: EventDetails = {
  id: "a07eec3c-c9a6-4af7-b34f-8fe82ea8a0f0",
  event_name: "FRIDAYS AT REUNION",
  main_artist_name: "BAKH,ABLA",
  other_artist_name: undefined,
  venue: {
    id: "9e68147d-0b20-477e-85c1-31c6a0232989",
    name: "Reunion DXB",
    image:
      "https://api.puravida.events/storage/club_images/eOdiR9gsE0MsIqGAQviyKQG58PQ2IsPCkunMGeVe.webp",
  },
  date_time: "2025-12-05 23:00:00",
  end_date: "2025-12-06 03:00:00",
  guest_close_date_time: "2025-12-05 22:00",
  file: "https://api.puravida.events/storage/event_images",
  address: "Radisson Blu Hotel, Dubai",
  guest_status: 1,
  description: ".\r\n- Guestlist closes at 10:00PM \r\n- Door Closes at 1:00AM",
  priority_entry_rules: undefined,
  guest_max_capacity: 100,
  current_guestlist_count: 25,
  is_guestlist_open: true,
  is_guestlist_full: false,
  table_max_capacity: 100,
  booking_status: 1,
  age_policy: undefined,
  type: 1,
  dress_codes: [],
  images: [
    {
      id: "a081f44a-8597-4fc6-b271-64080f9269fd",
      name: "https://api.puravida.events/storage/event_images/P4sYLUulB3q9p2EQJDPu9B21cgZKPgvKf6wF8tfi.mp4",
      url: "https://api.puravida.events/storage/event_images/https://api.puravida.events/storage/event_images/P4sYLUulB3q9p2EQJDPu9B21cgZKPgvKf6wF8tfi.mp4",
    },
  ],
  club_profile: undefined,
  restaurant_profile: undefined,
  total_wishlist_count: 0,
};

const EVENT_ID = "a07eec3c-c9a6-4af7-b34f-8fe82ea8a0f0";

export default function AblaBakhPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [event] = useState<EventDetails>(EVENT_DATA);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [countryCode, setCountryCode] = useState("971"); // Default to UAE
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [activationCode, setActivationCode] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Get the event banner image/video URL
  // Priority: images[0].name > event.file
  const eventBannerUrl =
    event?.images && event.images.length > 0
      ? event.images[0].name
      : event?.file;

  // Check if the event banner is a video file
  const isVideo = (() => {
    if (!eventBannerUrl) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
    const url = eventBannerUrl.toLowerCase();
    return videoExtensions.some((ext) => url.includes(ext));
  })();

  // Format date and time from API response
  const formatEventDate = (dateTime: string) => {
    const date = new Date(dateTime);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${days[date.getDay()]}, ${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatEventTime = (dateTime: string, endDate?: string) => {
    const start = new Date(dateTime);
    const startTime = start.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (endDate) {
      const end = new Date(endDate);
      const endTime = end.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  useEffect(() => {
    // Track page view
    trackPageView(`/abla-bakh`);

    // Show content immediately - no loading needed
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Intersection Observer to detect when form is visible
  useEffect(() => {
    if (!formRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsFormVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of form is visible
        rootMargin: "-100px 0px", // Add some margin to trigger earlier
      }
    );

    observer.observe(formRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!firstName.trim()) {
      setError("Please enter your first name");
      trackEvent("event_guestlist_error", {
        event_id: EVENT_ID,
        error_type: "missing_first_name",
      });
      return;
    }

    if (!lastName.trim()) {
      setError("Please enter your last name");
      trackEvent("event_guestlist_error", {
        event_id: EVENT_ID,
        error_type: "missing_last_name",
      });
      return;
    }

    if (!guestPhone.trim()) {
      setError("Please enter your phone number");
      trackEvent("event_guestlist_error", {
        event_id: EVENT_ID,
        error_type: "missing_phone",
      });
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(guestPhone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number");
      trackEvent("event_guestlist_error", {
        event_id: EVENT_ID,
        error_type: "invalid_phone",
      });
      return;
    }

    // Check if guestlist is open and not full
    if (!event?.is_guestlist_open) {
      setError("Guestlist registration is closed for this event.");
      return;
    }

    if (event?.is_guestlist_full) {
      setError("Guestlist is full for this event.");
      return;
    }

    setIsSubmitting(true);

    // Track submission attempt
    trackEvent("event_guestlist_submit", {
      event_id: EVENT_ID,
      event_name: event?.event_name,
    });

    // Extract ALL UTM parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source");
    const utmMedium = urlParams.get("utm_medium");
    const utmCampaign = urlParams.get("utm_campaign");
    const utmTerm = urlParams.get("utm_term");
    const utmContent = urlParams.get("utm_content");

    // Register to guestlist via API
    try {
      const result = await registerToGuestlist(EVENT_ID, {
        country_code: countryCode,
        phone: guestPhone.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        plus_one_count: 0,
        referral_link: window.location.href,
        utm_source: utmSource || undefined,
        utm_medium: utmMedium || undefined,
        utm_campaign: utmCampaign || undefined,
        utm_term: utmTerm || undefined,
        utm_content: utmContent || undefined,
      });

      if (result.success && result.data) {
        // Track success
        trackEvent("event_guestlist_success", {
          event_id: EVENT_ID,
          event_name: event?.event_name,
          already_registered: result.data.already_registered,
        });

        // Check if already registered
        if (result.data.already_registered) {
          setAlreadyRegistered(true);
          setIsSubmitted(true);
          setIsSubmitting(false);
        } else {
          // New registration - get activation code from response
          setAlreadyRegistered(false);
          setIsSubmitted(true);
          setIsSubmitting(false);

          // Activation code should be included in the registration response
          if (result.data.activation_code) {
            setActivationCode(result.data.activation_code);
          } else {
            // Fallback: log warning if activation code is missing
            console.warn("Activation code not found in registration response");
            // Still show success, but without activation code
            // User can still download the app
          }
        }
        
        setFirstName("");
        setLastName("");
        setGuestPhone("");
      } else {
        setError(result.message || "Failed to register to guestlist");
        setIsSubmitting(false);
        trackEvent("event_guestlist_error", {
          event_id: EVENT_ID,
          error_type: "api_error",
          error_message: result.message,
        });
      }
    } catch (err) {
      console.error("Error registering to guestlist:", err);
      setError("Network error. Please try again.");
      setIsSubmitting(false);
      trackEvent("event_guestlist_error", {
        event_id: EVENT_ID,
        error_type: "network_error",
      });
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      // Focus the first name input after a short delay to ensure scroll completes
      setTimeout(() => {
        firstNameInputRef.current?.focus();
      }, 300);
    }
    trackButtonClick("Join Guest List Sticky", 0, "event-page");
  };

  const handleDownloadApp = () => {
    trackButtonClick("Download App", 0, "success-card");
    redirectToAppStore();
  };

  const handleCopyActivationCode = () => {
    if (activationCode) {
      navigator.clipboard.writeText(activationCode);
      trackButtonClick("Copy Activation Code", 0, "success-card");
      // You could show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
        <div
          className="absolute top-40 right-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main
        className={`relative z-10 w-full max-w-7xl mx-auto lg:px-8 pt-8 lg:pt-16 pb-24 lg:pb-16 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 w-full lg:items-center">
          {/* Left Column - Event Details */}
          <div className="space-y-4 lg:space-y-3 animate-slide-in-right w-full">
            {/* Event Image/Poster - Full width on mobile */}
            <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-white/10 border-0 lg:border-2 border-white/10 rounded-none lg:rounded-2xl">
              {eventBannerUrl && isVideo ? (
                <video
                  src={eventBannerUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : eventBannerUrl ? (
                <Image
                  src={eventBannerUrl}
                  alt={event.event_name}
                  fill
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              {/* Tags at top - using dress codes or age policy */}
              {(event.dress_codes && event.dress_codes.length > 0) ||
              event.age_policy ? (
                <div className="absolute top-4 left-4 right-4">
                  <div className="flex flex-wrap gap-2">
                    {event.age_policy && (
                      <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium">
                        {event.age_policy}
                      </span>
                    )}
                    {event.dress_codes?.map((dressCode) => (
                      <span
                        key={dressCode.id}
                        className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium"
                      >
                        {dressCode.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Event Details Overlay at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                {/* Gradient fade overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm"></div>
                {/* Content */}
                <div className="relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm lg:text-base">
                      <svg
                        className="w-4 h-4 lg:w-5 lg:h-5 text-white/80 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-white font-medium">
                        {formatEventDate(event.date_time)}
                      </span>
                      <span className="text-white/50">•</span>
                      <span className="text-white font-medium">
                        {formatEventTime(event.date_time, event.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm lg:text-base">
                      <svg
                        className="w-4 h-4 lg:w-5 lg:h-5 text-white/80 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-white font-medium">
                        {event.venue?.name || event.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm lg:text-base">
                      <svg
                        className="w-4 h-4 lg:w-5 lg:h-5 text-white/80 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                      <span className="text-white font-medium">
                        {event.main_artist_name}
                        {event.other_artist_name
                          ? ` & ${event.other_artist_name}`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Guest List Form */}
          <div
            ref={formRef}
            className="space-y-6 animate-slide-in-right w-full lg:self-center"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Guest List Card */}
            <div
              className={`rounded-3xl p-4 lg:p-6 relative overflow-visible transition-all duration-500 ${
                isSubmitted
                  ? "bg-white border-2 border-black/10"
                  : "bg-white/10 backdrop-blur-sm border-2 border-white/20"
              }`}
            >
              {/* Animated background gradient - only show when not submitted */}
              {!isSubmitted && (
                <div className="absolute inset-0 bg-white/5 animate-pulse-slow rounded-3xl overflow-hidden"></div>
              )}

              <div className="relative z-10">
                {/* Success Card - New Registration */}
                {isSubmitted && !alreadyRegistered && (
                  <div className="space-y-4 animate-bounce-in">
                    {/* Success Icon */}
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Success Message */}
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl lg:text-3xl font-bold text-black">
                        You&apos;re on the list! 🎉
                      </h3>
                      <p className="text-black/70 text-sm">
                        Download the app to manage your guestlist and access
                        exclusive events
                      </p>
                    </div>

                    {/* Activation Code - Only show if available */}
                    {activationCode && (
                      <div className="bg-black/5 rounded-xl p-4 border-2 border-black/10">
                        <p className="text-black/60 text-xs font-medium mb-2 text-center">
                          Your Activation Code
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <code className="text-2xl lg:text-3xl font-bold text-black tracking-wider">
                            {activationCode}
                          </code>
                          <button
                            onClick={handleCopyActivationCode}
                            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                            title="Copy code"
                          >
                            <svg
                              className="w-5 h-5 text-black/60"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Download App Button */}
                    <button
                      onClick={handleDownloadApp}
                      className="w-full bg-black text-white font-bold py-4 px-6 rounded-xl hover:bg-black/90 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-base lg:text-lg"
                    >
                      <span>Download PuraVida App</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Success Card - Already Registered */}
                {isSubmitted && alreadyRegistered && (
                  <div className="space-y-4 animate-bounce-in">
                    {/* Info Icon */}
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl lg:text-3xl font-bold text-black">
                        You&apos;re already on the list!
                      </h3>
                      <p className="text-black/70 text-sm">
                        Download the app to manage your guestlist and access
                        all your events
                      </p>
                    </div>

                    {/* Download App Button */}
                    <button
                      onClick={handleDownloadApp}
                      className="w-full bg-black text-white font-bold py-4 px-6 rounded-xl hover:bg-black/90 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-base lg:text-lg"
                    >
                      <span>Download PuraVida App</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Guest List Form - Show when not submitted */}
                {!isSubmitted && (
                  <>
                    <div className="text-center mb-3 lg:mb-4">
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                        Join the Guest List
                      </h3>
                      <p className="text-white/80 text-xs">
                        Free Entry (Guest List)
                      </p>
                      {!event.is_guestlist_open && (
                        <p className="text-red-400 text-xs mt-1">
                          Registration is closed
                        </p>
                      )}
                      {event.is_guestlist_full && (
                        <p className="text-red-400 text-xs mt-1">
                          Guestlist is full
                        </p>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mb-2.5 bg-red-500/20 border border-red-500/50 rounded-xl p-2.5 animate-wiggle">
                        <p className="text-red-400 font-medium text-xs">{error}</p>
                      </div>
                    )}

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-2.5 lg:space-y-3"
                    >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-white font-medium mb-1.5 text-xs"
                      >
                        First Name
                      </label>
                      <input
                        ref={firstNameInputRef}
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-3 py-2.5 lg:py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-200 text-sm"
                        disabled={
                          isSubmitting ||
                          isSubmitted ||
                          !event.is_guestlist_open ||
                          event.is_guestlist_full
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-white font-medium mb-1.5 text-xs"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-3 py-2.5 lg:py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-200 text-sm"
                        disabled={
                          isSubmitting ||
                          isSubmitted ||
                          !event.is_guestlist_open ||
                          event.is_guestlist_full
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="guestPhone"
                      className="block text-white font-medium mb-1.5 text-xs"
                    >
                      Phone Number
                    </label>
                    <div className="flex gap-2 items-stretch">
                      <div className="flex-shrink-0">
                        <PhoneCodeSelector
                          value={countryCode}
                          onChange={setCountryCode}
                          className="h-full"
                        />
                      </div>
                      <input
                        type="tel"
                        id="guestPhone"
                        value={guestPhone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setGuestPhone(value);
                        }}
                        placeholder="501234567"
                        className="flex-1 px-3 py-2.5 lg:py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-200 text-sm"
                        disabled={
                          isSubmitting ||
                          isSubmitted ||
                          !event.is_guestlist_open ||
                          event.is_guestlist_full
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      isSubmitted ||
                      !event.is_guestlist_open ||
                      event.is_guestlist_full
                    }
                    className="w-full bg-white text-black font-bold py-2.5 lg:py-3 px-6 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm lg:text-base"
                    onClick={() =>
                      trackButtonClick("Join Guest List", 0, "event-page")
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-black"
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
                        <span>Adding you...</span>
                      </>
                    ) : isSubmitted ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>You&apos;re on the list!</span>
                      </>
                    ) : (
                      <>
                        <span>Join Guest List</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                    </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Join Guest List Button - Hide when form is visible */}
      <div
        className={`fixed bottom-4 left-4 right-4 lg:hidden z-50 transition-all duration-300 ${
          isFormVisible
            ? "opacity-0 pointer-events-none translate-y-4"
            : "opacity-100 pointer-events-auto translate-y-0"
        }`}
      >
        <button
          onClick={scrollToForm}
          className="w-full bg-white text-black font-bold py-4 px-6 rounded-xl shadow-2xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
        >
          <span>Join Guest List</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}



