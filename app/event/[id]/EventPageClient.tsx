"use client";

// React imports
import { useState, useEffect, useRef } from "react";

// Next.js imports
import Image from "next/image";
import Link from "next/link";

// Internal components
import PhoneCodeSelector from "@/components/PhoneCodeSelector";
import Header from "@/components/Header";

// Internal utilities
import {
  trackEvent,
  trackButtonClick,
  trackAppInstallClick,
} from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import {
  registerToGuestlist,
  getEventDetails,
  type EventDetails,
} from "@/lib/api";
import { redirectToAppStore, isIOS, isAndroid } from "@/lib/app-linking";
import { formatEventDate, formatEventTime, isVideoUrl } from "@/lib/utils";

interface EventPageClientProps {
  eventId: string;
  initialEvent?: EventDetails | null;
}

export default function EventPageClient({
  eventId,
  initialEvent,
}: EventPageClientProps) {
  // Get the actual event ID from URL (in case we're on the fallback page)
  const [actualEventId, setActualEventId] = useState(eventId);
  const [isVisible, setIsVisible] = useState(false);
  const [event, setEvent] = useState<EventDetails | null>(initialEvent || null);
  const [isLoading, setIsLoading] = useState(!initialEvent);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [countryCode, setCountryCode] = useState("971"); // Default to UAE
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loadingError, setLoadingError] = useState(""); // For page loading errors (full screen)
  const [formError, setFormError] = useState(""); // For form validation errors (in form box only)
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [activationCode, setActivationCode] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Tracking state
  const [pageLoadTime] = useState(Date.now());
  const [formStartTime, setFormStartTime] = useState<number | null>(null);
  const [hasTrackedScrollDepth, setHasTrackedScrollDepth] = useState({
    "25": false,
    "50": false,
    "75": false,
    "100": false,
  });
  const [hasInteractedWithForm, setHasInteractedWithForm] = useState(false);

  // Get the event banner image/video URL
  // Priority: images[0].name > event.file
  const eventBannerUrl =
    event?.images && event.images.length > 0
      ? event.images[0].name
      : event?.file;

  // Check if the event banner is a video file
  const isVideo = isVideoUrl(eventBannerUrl);

  useEffect(() => {
    // Get the actual event ID from the URL path
    // With SSR, the eventId prop should match the URL, but we extract from URL as a fallback
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const eventIndex = pathParts.indexOf("event");
    const urlEventId =
      eventIndex >= 0 && pathParts[eventIndex + 1]
        ? pathParts[eventIndex + 1]
        : null;

    // Use the URL event ID if available, otherwise use the prop
    const finalEventId = urlEventId || eventId;

    if (!finalEventId) {
      setLoadingError("Invalid event ID");
      setIsLoading(false);
      return;
    }

    setActualEventId(finalEventId);

    // If we have initial event data from server, use it and skip fetch
    if (initialEvent && initialEvent.id === finalEventId) {
      setEvent(initialEvent);
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    // Fetch event data from API (fallback for client-side navigation)
    const fetchEventData = async () => {
      setIsLoading(true);
      setLoadingError("");

      const loadStartTime = Date.now();

      try {
        const result = await getEventDetails(finalEventId);

        const loadTime = Date.now() - loadStartTime;

        if (result.success && result.data) {
          setEvent(result.data);
          setIsVisible(true);

          // Calculate capacity percentage
          const capacityPercentage = result.data.guest_max_capacity
            ? Math.round(
                (result.data.current_guestlist_count /
                  result.data.guest_max_capacity) *
                  100
              )
            : 0;

          // Track successful event load with comprehensive metadata
          trackEvent("event_page_loaded", {
            event_id: finalEventId,
            event_name: result.data.event_name,
            venue_name: result.data.venue?.name,
            venue_id: result.data.venue?.id,
            artist_name: result.data.main_artist_name,
            event_date: result.data.date_time,
            is_guestlist_open: result.data.is_guestlist_open,
            is_guestlist_full: result.data.is_guestlist_full,
            guestlist_capacity: result.data.guest_max_capacity,
            guestlist_current_count: result.data.current_guestlist_count,
            capacity_percentage: capacityPercentage,
            has_video_banner: result.data.images?.[0]?.name?.includes(".mp4"),
            load_time_ms: loadTime,
          });
        } else {
          const errorMessage = result.message || "Event not found";
          setLoadingError(errorMessage);

          // Track event load error
          trackEvent("event_page_error", {
            event_id: finalEventId,
            error_type: "event_not_found",
            error_message: errorMessage,
            load_time_ms: Date.now() - loadStartTime,
          });
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        const errorMessage = "Failed to load event. Please try again.";
        setLoadingError(errorMessage);

        // Track event load network error
        trackEvent("event_page_error", {
          event_id: finalEventId,
          error_type: "network_error",
          error_message: err instanceof Error ? err.message : "Unknown error",
          load_time_ms: Date.now() - loadStartTime,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, initialEvent]);

  // Intersection Observer to detect when form is visible
  useEffect(() => {
    if (!formRef.current || !event) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const wasVisible = isFormVisible;
          const nowVisible = entry.isIntersecting;

          // Hide sticky button when form is approaching viewport
          setIsFormVisible(nowVisible);

          // Track when form enters viewport for the first time
          if (nowVisible && !wasVisible) {
            trackEvent("event_form_viewed", {
              event_id: actualEventId,
              event_name: event.event_name,
              time_to_view_seconds: Math.round(
                (Date.now() - pageLoadTime) / 1000
              ),
            });
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -200px 0px",
      }
    );

    observer.observe(formRef.current);

    return () => {
      observer.disconnect();
    };
  }, [event, actualEventId, pageLoadTime, isFormVisible]);

  // Scroll depth tracking
  useEffect(() => {
    if (!event) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Track scroll depth milestones
      if (scrollPercentage >= 25 && !hasTrackedScrollDepth["25"]) {
        trackEvent("event_scroll_depth", {
          event_id: actualEventId,
          depth: 25,
        });
        setHasTrackedScrollDepth((prev) => ({ ...prev, "25": true }));
      }
      if (scrollPercentage >= 50 && !hasTrackedScrollDepth["50"]) {
        trackEvent("event_scroll_depth", {
          event_id: actualEventId,
          depth: 50,
        });
        setHasTrackedScrollDepth((prev) => ({ ...prev, "50": true }));
      }
      if (scrollPercentage >= 75 && !hasTrackedScrollDepth["75"]) {
        trackEvent("event_scroll_depth", {
          event_id: actualEventId,
          depth: 75,
        });
        setHasTrackedScrollDepth((prev) => ({ ...prev, "75": true }));
      }
      if (scrollPercentage >= 100 && !hasTrackedScrollDepth["100"]) {
        trackEvent("event_scroll_depth", {
          event_id: actualEventId,
          depth: 100,
        });
        setHasTrackedScrollDepth((prev) => ({ ...prev, "100": true }));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [event, actualEventId, hasTrackedScrollDepth]);

  // Time on page tracking - track at exit
  useEffect(() => {
    if (!event) return;

    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000);
      trackEvent("event_time_on_page", {
        event_id: actualEventId,
        time_seconds: timeOnPage,
        form_submitted: isSubmitted,
        form_started: hasInteractedWithForm,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [event, actualEventId, pageLoadTime, isSubmitted, hasInteractedWithForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const submitStartTime = Date.now();
    const timeToSubmit = formStartTime
      ? Math.round((submitStartTime - formStartTime) / 1000)
      : null;

    // Validation
    if (!firstName.trim()) {
      setFormError("Please enter your first name");
      trackEvent("event_validation_error", {
        event_id: actualEventId,
        event_name: event?.event_name,
        field: "first_name",
        error_type: "missing_first_name",
        time_to_error_seconds: timeToSubmit,
      });
      return;
    }

    if (!lastName.trim()) {
      setFormError("Please enter your last name");
      trackEvent("event_validation_error", {
        event_id: actualEventId,
        event_name: event?.event_name,
        field: "last_name",
        error_type: "missing_last_name",
        time_to_error_seconds: timeToSubmit,
      });
      return;
    }

    if (!guestPhone.trim()) {
      setFormError("Please enter your phone number");
      trackEvent("event_validation_error", {
        event_id: actualEventId,
        event_name: event?.event_name,
        field: "phone",
        error_type: "missing_phone",
        time_to_error_seconds: timeToSubmit,
      });
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(guestPhone.replace(/\s/g, ""))) {
      setFormError("Please enter a valid phone number");
      trackEvent("event_validation_error", {
        event_id: actualEventId,
        event_name: event?.event_name,
        field: "phone",
        error_type: "invalid_phone",
        phone_length: guestPhone.length,
        time_to_error_seconds: timeToSubmit,
      });
      return;
    }

    // Check if guestlist is open and not full
    if (!event?.is_guestlist_open) {
      setFormError("Guestlist registration is closed for this event.");
      trackEvent("event_guestlist_closed_attempt", {
        event_id: actualEventId,
        event_name: event?.event_name,
      });
      return;
    }

    if (event?.is_guestlist_full) {
      setFormError("Guestlist is full for this event.");
      trackEvent("event_guestlist_full_attempt", {
        event_id: actualEventId,
        event_name: event?.event_name,
        capacity: event.guest_max_capacity,
        current_count: event.current_guestlist_count,
      });
      return;
    }

    setIsSubmitting(true);

    // Track submission attempt with timing
    trackEvent("event_guestlist_submit_attempt", {
      event_id: actualEventId,
      event_name: event?.event_name,
      venue_name: event?.venue?.name,
      time_to_submit_seconds: timeToSubmit,
      country_code: countryCode,
    });

    // Get attribution data (includes all UTM parameters and click IDs)
    const attribution = getAttribution();

    // Register to guestlist via API
    try {
      const result = await registerToGuestlist(actualEventId, {
        country_code: countryCode,
        phone: guestPhone.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        plus_one_count: 0,
        referral_link: window.location.href,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        utm_term: attribution.utm_term,
        utm_content: attribution.utm_content,
        gclid: attribution.gclid,
        fbclid: attribution.fbclid,
        ttclid: attribution.ttclid,
        li_fat_id: attribution.li_fat_id,
        msclkid: attribution.msclkid,
        ref: attribution.ref,
      });

      const totalTime = Date.now() - submitStartTime;

      if (result.success && result.data) {
        // Check if already registered
        const wasAlreadyRegistered = result.data.already_registered;

        // Track success with comprehensive details
        trackEvent("event_guestlist_success", {
          event_id: actualEventId,
          event_name: event?.event_name,
          venue_name: event?.venue?.name,
          artist_name: event?.main_artist_name,
          already_registered: wasAlreadyRegistered,
          time_to_complete_seconds: timeToSubmit,
          api_response_time_ms: totalTime,
          has_activation_code: !!result.data.activation_code,
          country_code: countryCode,
        });

        if (wasAlreadyRegistered) {
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
            trackEvent("event_activation_code_missing", {
              event_id: actualEventId,
            });
          }
        }

        setFirstName("");
        setLastName("");
        setGuestPhone("");

        // Update guest count locally (no API refresh)
        if (event && !wasAlreadyRegistered) {
          setEvent({
            ...event,
            current_guestlist_count: event.current_guestlist_count + 1,
          });
        }
      } else {
        const errorMessage =
          result.message || "Failed to register to guestlist";
        setFormError(errorMessage);
        setIsSubmitting(false);
        trackEvent("event_guestlist_api_error", {
          event_id: actualEventId,
          event_name: event?.event_name,
          error_message: errorMessage,
          api_response_time_ms: totalTime,
          country_code: countryCode,
        });
      }
    } catch (err) {
      console.error("Error registering to guestlist:", err);
      const errorMessage = "Network error. Please try again.";
      setFormError(errorMessage);
      setIsSubmitting(false);
      trackEvent("event_guestlist_network_error", {
        event_id: actualEventId,
        event_name: event?.event_name,
        error_message: err instanceof Error ? err.message : "Unknown error",
        country_code: countryCode,
      });
    }
  };

  const scrollToForm = () => {
    // Immediately hide the sticky button when clicked
    setIsFormVisible(true);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      // Focus the first name input after a short delay to ensure scroll completes
      setTimeout(() => {
        firstNameInputRef.current?.focus();
      }, 300);
    }
    trackButtonClick("Join Guest List Sticky", 0, "event-page");
    trackEvent("event_scroll_to_form", {
      event_id: actualEventId,
      event_name: event?.event_name,
    });
  };

  const handleDownloadApp = () => {
    trackButtonClick("Download App", 0, "success-card");
    trackEvent("event_download_app_click", {
      event_id: actualEventId,
      event_name: event?.event_name,
      from_state: alreadyRegistered ? "already_registered" : "new_registration",
    });

    // Track app install click with platform detection (only for mobile)
    if (isIOS()) {
      trackAppInstallClick("ios", "event-success-card");
    } else if (isAndroid()) {
      trackAppInstallClick("android", "event-success-card");
    }

    redirectToAppStore();
  };

  const handleCopyActivationCode = () => {
    if (activationCode) {
      navigator.clipboard.writeText(activationCode);
      trackButtonClick("Copy Activation Code", 0, "success-card");
      trackEvent("event_activation_code_copied", {
        event_id: actualEventId,
        event_name: event?.event_name,
      });
    }
  };

  // Track form field interactions
  const handleFieldFocus = (fieldName: string) => {
    if (!hasInteractedWithForm) {
      setHasInteractedWithForm(true);
      setFormStartTime(Date.now());
      trackEvent("event_form_started", {
        event_id: actualEventId,
        event_name: event?.event_name,
        first_field: fieldName,
        time_to_start_seconds: Math.round((Date.now() - pageLoadTime) / 1000),
      });
    }

    trackEvent("event_field_focus", {
      event_id: actualEventId,
      field_name: fieldName,
    });
  };

  const handleFieldBlur = (fieldName: string, hasValue: boolean) => {
    trackEvent("event_field_blur", {
      event_id: actualEventId,
      field_name: fieldName,
      has_value: hasValue,
    });
  };

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    trackEvent("event_country_code_changed", {
      event_id: actualEventId,
      from_code: countryCode,
      to_code: newCode,
    });
  };

  // Track error page display
  useEffect(() => {
    if (!isLoading && (!event || loadingError)) {
      trackEvent("event_error_page_displayed", {
        event_id: actualEventId,
        error_message: loadingError || "Event not found",
      });
    }
  }, [isLoading, event, loadingError, actualEventId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading event...</div>
      </div>
    );
  }

  if (!event || loadingError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">
            {loadingError || "Event not found"}
          </div>
          <Link
            href="/"
            className="text-white/60 hover:text-white underline"
            onClick={() => {
              trackEvent("event_error_go_home_click", {
                event_id: actualEventId,
              });
            }}
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
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
        {" "}
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
                  onPlay={() => {
                    trackEvent("event_video_played", {
                      event_id: actualEventId,
                      event_name: event.event_name,
                    });
                  }}
                  onError={() => {
                    trackEvent("event_video_error", {
                      event_id: actualEventId,
                      video_url: eventBannerUrl,
                    });
                  }}
                />
              ) : eventBannerUrl ? (
                <Image
                  src={eventBannerUrl}
                  alt={event.event_name}
                  fill
                  className="object-cover"
                  onError={() => {
                    trackEvent("event_image_error", {
                      event_id: actualEventId,
                      image_url: eventBannerUrl,
                    });
                  }}
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
                        {formatEventTime(event.date_time, event.end_date)} <span className="text-white/60 text-sm">(Dubai time)</span>
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
                        Download the app to manage your guestlist and access all
                        your events
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
                    {formError && (
                      <div className="mb-2.5 bg-red-500/20 border border-red-500/50 rounded-xl p-2.5 animate-wiggle">
                        <p className="text-red-400 font-medium text-xs">
                          {formError}
                        </p>
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
                            onFocus={() => handleFieldFocus("first_name")}
                            onBlur={() =>
                              handleFieldBlur(
                                "first_name",
                                firstName.trim().length > 0
                              )
                            }
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
                            onFocus={() => handleFieldFocus("last_name")}
                            onBlur={() =>
                              handleFieldBlur(
                                "last_name",
                                lastName.trim().length > 0
                              )
                            }
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
                              onChange={handleCountryCodeChange}
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
                            onFocus={() => handleFieldFocus("phone")}
                            onBlur={() =>
                              handleFieldBlur(
                                "phone",
                                guestPhone.trim().length > 0
                              )
                            }
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
                        onClick={() => {
                          trackButtonClick("Join Guest List", 0, "event-page");
                          trackEvent("event_submit_button_click", {
                            event_id: actualEventId,
                            event_name: event?.event_name,
                            has_first_name: firstName.trim().length > 0,
                            has_last_name: lastName.trim().length > 0,
                            has_phone: guestPhone.trim().length > 0,
                          });
                        }}
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
