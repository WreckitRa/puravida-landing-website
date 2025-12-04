"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { trackPageView, trackEvent, trackButtonClick } from "@/lib/analytics";
import PhoneCodeSelector from "@/components/PhoneCodeSelector";
import Header from "@/components/Header";

// Mock event data - in production, this would come from an API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_EVENTS: Record<string, any> = {
  "summer-vibes-2024": {
    id: "summer-vibes-2024",
    title: "Summer Vibes 2024",
    subtitle: "The Ultimate Beach Party",
    date: "Saturday, July 15, 2024",
    time: "10:00 PM - 4:00 AM",
    venue: "White Beach, Atlantis The Palm",
    location: "Dubai, UAE",
    description:
      "Join us for an unforgettable night under the stars! Experience Dubai's hottest DJ lineup, premium cocktails, and the most exclusive beach party of the summer. Dress code: Beach chic & glamorous.",
    image:
      "https://api.puravida.events/storage/event_images/JjAAlE9wi4V3fRyUQmbp10HC8AOSJKHMjT7GP862.mp4", // Placeholder - you can add event images
    dj: "DJ Khaled & Special Guests",
    price: "Free Entry (Guest List)",
    capacity: 500,
    currentGuests: 342,
    tags: ["Beach Party", "DJ Set", "VIP", "Outdoor"],
    organizer: "PuraVida",
  },
  "rooftop-sessions": {
    id: "rooftop-sessions",
    title: "Rooftop Sessions",
    subtitle: "Sky-High Nightlife Experience",
    date: "Friday, August 2, 2024",
    time: "9:00 PM - 3:00 AM",
    venue: "Ce La Vi, Address Sky View",
    location: "Dubai, UAE",
    description:
      "Elevate your night at Dubai's most exclusive rooftop venue. Stunning city views, world-class DJs, and premium bottle service. Limited guest list spots available.",
    image: "/assets/puravida-main-logo.png",
    dj: "International DJ Lineup",
    price: "Free Entry (Guest List)",
    capacity: 300,
    currentGuests: 198,
    tags: ["Rooftop", "City Views", "Premium", "Exclusive"],
    organizer: "PuraVida",
  },
  "pool-party": {
    id: "pool-party",
    title: "Pool Party Paradise",
    subtitle: "Day to Night Celebration",
    date: "Sunday, July 28, 2024",
    time: "2:00 PM - 10:00 PM",
    venue: "Nikki Beach Dubai",
    location: "Dubai, UAE",
    description:
      "Dive into the ultimate pool party experience! Day-to-night celebration with live DJs, poolside cocktails, and the most vibrant crowd in Dubai.",
    image: "/assets/puravida-main-logo.png",
    dj: "Live DJ Sets All Day",
    price: "Free Entry (Guest List)",
    capacity: 400,
    currentGuests: 267,
    tags: ["Pool Party", "Day Party", "Beach Club", "Vibrant"],
    organizer: "PuraVida",
  },
};

interface GuestListEntry {
  name: string;
  phone: string;
  countryCode: string;
  timestamp: string;
}

interface EventPageClientProps {
  eventId: string;
}

export default function EventPageClient({ eventId }: EventPageClientProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [countryCode, setCountryCode] = useState("971"); // Default to UAE
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [guestList, setGuestList] = useState<GuestListEntry[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Compute event data from eventId using useMemo instead of state
  const event = useMemo(() => {
    return MOCK_EVENTS[eventId] || MOCK_EVENTS["summer-vibes-2024"];
  }, [eventId]);

  // Check if the event image is a video file
  // Since event is already memoized, we can compute this directly
  const isVideo = (() => {
    if (!event?.image) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
    const url = event.image.toLowerCase();
    return videoExtensions.some((ext) => url.includes(ext));
  })();

  useEffect(() => {
    // Track page view
    trackPageView(`/event/${eventId}`);

    // Load guest list from localStorage (mock persistence)
    const storedGuests = localStorage.getItem(`event_${eventId}_guests`);
    if (storedGuests) {
      try {
        const guests = JSON.parse(storedGuests);
        // Defer setState to avoid synchronous state updates in effect
        requestAnimationFrame(() => {
          setGuestList(guests);
        });
      } catch (e) {
        console.error("Error loading guest list:", e);
      }
    }

    // Fade in animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, [eventId]);

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
    if (!guestName.trim()) {
      setError("Please enter your name");
      trackEvent("event_guestlist_error", {
        event_id: eventId,
        error_type: "missing_name",
      });
      return;
    }

    if (!guestPhone.trim()) {
      setError("Please enter your phone number");
      trackEvent("event_guestlist_error", {
        event_id: eventId,
        error_type: "missing_phone",
      });
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(guestPhone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number");
      trackEvent("event_guestlist_error", {
        event_id: eventId,
        error_type: "invalid_phone",
      });
      return;
    }

    setIsSubmitting(true);

    // Track submission attempt
    trackEvent("event_guestlist_submit", {
      event_id: eventId,
      event_name: event?.title,
    });

    // Simulate API call (mock)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add to guest list
    const newGuest: GuestListEntry = {
      name: guestName.trim(),
      phone: guestPhone.trim(),
      countryCode,
      timestamp: new Date().toISOString(),
    };

    const updatedGuests = [...guestList, newGuest];
    setGuestList(updatedGuests);

    // Save to localStorage (mock persistence)
    localStorage.setItem(
      `event_${eventId}_guests`,
      JSON.stringify(updatedGuests)
    );

    // Track success
    trackEvent("event_guestlist_success", {
      event_id: eventId,
      event_name: event?.title,
    });

    setIsSubmitted(true);
    setIsSubmitting(false);
    setGuestName("");
    setGuestPhone("");

    // Reset success message after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      // Focus the name input after a short delay to ensure scroll completes
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 300);
    }
    trackButtonClick("Join Guest List Sticky", 0, "event-page");
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading event...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
        <div
          className="absolute top-40 right-10 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main
        className={`relative z-10 w-full max-w-7xl mx-auto lg:px-8 pt-8 lg:pt-4 pb-24 lg:pb-4 transition-all duration-700 lg:min-h-[calc(100vh-80px)] lg:flex lg:flex-col lg:justify-center ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {" "}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 w-full lg:items-center">
          {/* Left Column - Event Details */}
          <div className="space-y-4 lg:space-y-3 animate-slide-in-right w-full">
            {/* Event Image/Poster - Full width on mobile */}
            <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-0 lg:border-2 border-white/10 rounded-none lg:rounded-2xl">
              {event.image && isVideo ? (
                <video
                  src={event.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : event.image ? (
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              {/* Tags at top */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

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
                        {event.date}
                      </span>
                      <span className="text-white/50">•</span>
                      <span className="text-white font-medium">
                        {event.time}
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
                        {event.venue}
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
                      <span className="text-white font-medium">{event.dj}</span>
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
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-4 lg:p-5 lg:p-6 relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-pulse-slow"></div>

              <div className="relative z-10">
                <div className="text-center mb-3 lg:mb-4">
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                    Join the Guest List
                  </h3>
                  <p className="text-white/80 text-xs">{event.price}</p>
                </div>

                {/* Success Message */}
                {isSubmitted && (
                  <div className="mb-2.5 bg-green-500/20 border border-green-500/50 rounded-xl p-2.5 animate-bounce-in">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-400 flex-shrink-0"
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
                      <div>
                        <p className="text-green-400 font-bold text-xs">
                          You&apos;re on the list! 🎉
                        </p>
                        <p className="text-green-300/80 text-xs">
                          We&apos;ll send you confirmation details soon.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-2.5 bg-red-500/20 border border-red-500/50 rounded-xl p-2.5 animate-wiggle">
                    <p className="text-red-400 font-medium text-xs">{error}</p>
                  </div>
                )}

                {/* Guest List Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-2.5 lg:space-y-3"
                >
                  <div>
                    <label
                      htmlFor="guestName"
                      className="block text-white font-medium mb-1.5 text-xs"
                    >
                      Full Name
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      id="guestName"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2.5 lg:py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-sm"
                      disabled={isSubmitting || isSubmitted}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="guestPhone"
                      className="block text-white font-medium mb-1.5 text-xs"
                    >
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <PhoneCodeSelector
                        value={countryCode}
                        onChange={setCountryCode}
                        className="flex-shrink-0"
                      />
                      <input
                        type="tel"
                        id="guestPhone"
                        value={guestPhone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setGuestPhone(value);
                        }}
                        placeholder="501234567"
                        className="flex-1 px-3 py-2.5 lg:py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-sm"
                        disabled={isSubmitting || isSubmitted}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2.5 lg:py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm lg:text-base"
                    onClick={() =>
                      trackButtonClick("Join Guest List", 0, "event-page")
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
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

                {/* Terms */}
                <p className="text-white/40 text-xs text-center mt-2">
                  By joining, you agree to receive event updates via SMS
                </p>
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
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl shadow-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
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
