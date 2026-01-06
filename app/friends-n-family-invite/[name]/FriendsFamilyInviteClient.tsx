"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import PhoneCodeSelector from "@/components/PhoneCodeSelector";
import { trackEvent, trackButtonClick } from "@/lib/analytics";
import { formatEventDate, formatEventTime, isVideoUrl } from "@/lib/utils";

interface PartyConfig {
  partyName: string;
  partyBanner: {
    type: "image" | "video";
    url: string;
  };
  guestlistCloseTime: string;
  partyStartTime: string;
  sheetUrl: string;
}

interface FriendsFamilyInviteClientProps {
  inviterName: string; // Display name (without timestamp)
  originalInviterName: string; // Original name (with timestamp) for sheet
  partyConfig: PartyConfig; // Initial config (may be wrong if event param not read)
  sheetId: string | null;
}

export default function FriendsFamilyInviteClient({
  inviterName,
  originalInviterName,
  partyConfig: initialPartyConfig,
  sheetId: initialSheetId,
}: FriendsFamilyInviteClientProps) {
  const searchParams = useSearchParams();
  const [partyConfig, setPartyConfig] = useState<PartyConfig>(initialPartyConfig);
  const [sheetId, setSheetId] = useState<string | null>(initialSheetId);

  // Extract sheet ID helper
  const extractSheetId = (sheetUrl: string): string | null => {
    try {
      const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };
  const [isVisible, setIsVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("971"); // Default to UAE
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isGuestlistClosed, setIsGuestlistClosed] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [personalLink, setPersonalLink] = useState<string>("");
  const [linkCopied, setLinkCopied] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  // Load correct event config from client-side URL
  useEffect(() => {
    const eventParam = searchParams.get("event");
    
    console.log("Client-side event parameter:", eventParam);
    console.log("Current party config:", partyConfig.partyName);
    
    if (eventParam && eventParam !== initialPartyConfig.partyName) {
      // Fetch the correct config based on event parameter
      fetch("/api/party-config")
        .then((res) => res.json())
        .then((data) => {
          if (data.events && data.events[eventParam]) {
            const correctConfig = data.events[eventParam];
            setPartyConfig(correctConfig);
            const newSheetId = extractSheetId(correctConfig.sheetUrl);
            setSheetId(newSheetId);
            console.log("✅ Loaded correct event config:", eventParam);
            console.log("✅ Party name:", correctConfig.partyName);
            console.log("✅ Banner URL:", correctConfig.partyBanner?.url);
          } else {
            console.warn("Event not found in config:", eventParam);
          }
        })
        .catch((err) => {
          console.error("Error loading party config:", err);
        });
    }
  }, [searchParams, initialPartyConfig.partyName]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Store inviter name in localStorage so Header can display it
    if (typeof window !== "undefined" && inviterName) {
      localStorage.setItem(
        "invite",
        JSON.stringify({ invite: encodeURIComponent(inviterName) })
      );
    }

    // Check if guestlist is closed
    const closeTime = new Date(partyConfig.guestlistCloseTime);
    const now = new Date();
    if (now > closeTime) {
      setIsGuestlistClosed(true);
    }

    // Debug logging
    console.log("Party Config:", partyConfig);
    console.log("Banner URL:", partyConfig.partyBanner?.url);
    console.log("Banner Type:", partyConfig.partyBanner?.type);

    // Track page view
    trackEvent("friends_family_invite_page_viewed", {
      inviter_name: inviterName,
      party_name: partyConfig.partyName,
    });
  }, [inviterName, partyConfig]);

  // Intersection Observer to detect when form is visible
  useEffect(() => {
    if (!formRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const nowVisible = entry.isIntersecting;
          setIsFormVisible(nowVisible);
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
  }, []);

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
    trackButtonClick("RSVP Sticky", 0, "friends-family-invite");
    trackEvent("friends_family_scroll_to_form", {
      inviter_name: inviterName,
      party_name: partyConfig.partyName,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsDuplicate(false);

    // Check if guestlist is closed
    if (isGuestlistClosed) {
      setError("Guestlist registration is closed");
      return;
    }

    // Validation
    if (!firstName.trim()) {
      setError("Please enter your first name");
      return;
    }

    if (!lastName.trim()) {
      setError("Please enter your last name");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number");
      return;
    }

    if (!sheetId) {
      setError("Sheet configuration error. Please contact support.");
      return;
    }

    setIsSubmitting(true);

    trackEvent("friends_family_rsvp_submit_attempt", {
      inviter_name: inviterName,
      party_name: partyConfig.partyName,
    });

    try {
      const response = await fetch("/api/house-party-rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviterName: originalInviterName, // Use original name with timestamp for sheet
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          countryCode,
          email: email.trim() || undefined,
          eventName: partyConfig.partyName, // Add event name
          sheetId, // Pass sheet ID to API
        }),
      });

      const result = await response.json();

      if (response.status === 409 || result.duplicate) {
        setIsDuplicate(true);
        setError("You have already RSVP'd for this event");
        trackEvent("friends_family_rsvp_duplicate", {
          inviter_name: inviterName,
          party_name: partyConfig.partyName,
        });
      } else if (!response.ok || !result.success) {
        setError(result.message || "Failed to submit RSVP. Please try again.");
        trackEvent("friends_family_rsvp_error", {
          inviter_name: inviterName,
          party_name: partyConfig.partyName,
          error_message: result.message,
        });
      } else {
        // Store firstName before clearing for link generation
        const savedFirstName = firstName.trim();
        
        // Generate personal link
        const timestamp = Date.now();
        const firstNameLower = savedFirstName.toLowerCase().replace(/\s+/g, "-");
        const eventParam = typeof window !== "undefined" 
          ? new URLSearchParams(window.location.search).get("event") || ""
          : "";
        const eventQuery = eventParam ? `?event=${eventParam}` : "";
        const personalInviteLink = typeof window !== "undefined"
          ? `${window.location.origin}/friends-n-family-invite/${firstNameLower}-${timestamp}${eventQuery}`
          : "";
        
        setIsSubmitted(true);
        setPersonalLink(personalInviteLink);
        setFirstName("");
        setLastName("");
        setPhone("");
        setEmail("");
        trackEvent("friends_family_rsvp_success", {
          inviter_name: inviterName,
          party_name: partyConfig.partyName,
        });
      }
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      setError("Network error. Please try again.");
      trackEvent("friends_family_rsvp_network_error", {
        inviter_name: inviterName,
        party_name: partyConfig.partyName,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVideo = isVideoUrl(partyConfig.partyBanner.url);
  const partyDate = formatEventDate(partyConfig.partyStartTime);
  const partyTime = formatEventTime(partyConfig.partyStartTime);
  const guestlistCloseDate = formatEventDate(partyConfig.guestlistCloseTime);
  const guestlistCloseTime = formatEventTime(partyConfig.guestlistCloseTime);

  return (
    <div className="bg-black min-h-screen">
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
      <Header inviterName={inviterName} />

      {/* Main Content */}
      <main
        className={`relative z-10 w-full max-w-7xl mx-auto lg:px-8 pt-8 lg:pt-16 pb-24 lg:pb-16 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 w-full lg:items-center">
          {/* Left Column - Event Banner & Details */}
          <div className="space-y-6 animate-slide-in-right w-full">
            {/* Event Banner Image/Video */}
            <div className="relative w-full border-2 border-white/10 rounded-2xl overflow-hidden">
              {isVideo ? (
                <video
                  src={partyConfig.partyBanner.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                />
              ) : (
                <div className="relative w-full">
                  {partyConfig.partyBanner?.url ? (
                    <Image
                      src={partyConfig.partyBanner.url}
                      alt={partyConfig.partyName}
                      width={1200}
                      height={800}
                      className="w-full h-auto object-contain"
                      unoptimized
                      priority
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-[#E91180]/20 to-[#EB1E44]/20 flex items-center justify-center">
                      <p className="text-white/60">Banner image not found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Event Details Card */}
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 space-y-4">
              <h3 className="text-2xl font-bold text-white mb-4">Event Details</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-white/80 flex-shrink-0 mt-1"
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
                  <div>
                    <p className="text-white/60 text-sm">Party Date & Time</p>
                    <p className="text-white font-medium">{partyDate}</p>
                    <p className="text-white font-medium">{partyTime} <span className="text-white/60 text-sm">(Dubai time)</span></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-white/80 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-white/60 text-sm">Guestlist Closes</p>
                    <p className="text-white font-medium">{guestlistCloseDate}</p>
                    <p className="text-white font-medium">{guestlistCloseTime} <span className="text-white/60 text-sm">(Dubai time)</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - RSVP Form */}
          <div
            ref={formRef}
            className="space-y-6 animate-slide-in-right w-full lg:self-center"
          >
            <div
              className={`rounded-3xl p-6 relative overflow-visible transition-all duration-500 ${
                isSubmitted
                  ? "bg-white border-2 border-black/10"
                  : "bg-white/10 backdrop-blur-sm border-2 border-white/20"
              }`}
            >
              {/* Success Card */}
              {isSubmitted && (
                <div className="space-y-4 animate-bounce-in">
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

                  <div className="text-center space-y-4">
                    <h3 className="text-2xl lg:text-3xl font-bold text-black">
                      Invite your crew with this link 🔗
                    </h3>
                    
                    {/* Personal Link */}
                    <div className="bg-black/5 rounded-xl p-4 border-2 border-black/10">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          readOnly
                          value={personalLink}
                          className="flex-1 px-3 py-2 bg-white border border-black/20 rounded-lg text-black text-sm font-mono focus:outline-none"
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(personalLink);
                              setLinkCopied(true);
                              trackButtonClick("Copy Personal Link", 0, "success-card");
                              setTimeout(() => setLinkCopied(false), 2000);
                            } catch (err) {
                              console.error("Failed to copy:", err);
                            }
                          }}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors font-medium text-sm flex items-center gap-2"
                        >
                          {linkCopied ? (
                            <>
                              <svg
                                className="w-4 h-4"
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
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
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
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RSVP Form */}
              {!isSubmitted && (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      RSVP Now
                    </h3>
                    <p className="text-white/80 text-sm">
                      Secure your spot at this exclusive event
                    </p>
                    {isGuestlistClosed && (
                      <p className="text-red-400 text-sm mt-2 font-medium">
                        Guestlist registration is closed
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {(error || isDuplicate) && (
                    <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-xl p-3 animate-wiggle">
                      <p className="text-red-400 font-medium text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
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
                          className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-200 text-sm"
                          disabled={isSubmitting || isGuestlistClosed}
                          required
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
                          className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-200 text-sm"
                          disabled={isSubmitting || isGuestlistClosed}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
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
                          id="phone"
                          value={phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setPhone(value);
                          }}
                          placeholder="501234567"
                          className="flex-1 px-3 py-2.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-200 text-sm"
                          disabled={isSubmitting || isGuestlistClosed}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-white font-medium mb-1.5 text-xs"
                      >
                        Email <span className="text-white/50">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-200 text-sm"
                        disabled={isSubmitting || isGuestlistClosed}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isGuestlistClosed}
                      className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-base"
                      onClick={() => {
                        trackButtonClick("RSVP Submit", 0, "friends-family-invite");
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
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm RSVP</span>
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
      </main>

      {/* Sticky RSVP Button - Hide when form is visible */}
      <div
        className={`fixed bottom-4 left-4 right-4 lg:hidden z-50 transition-all duration-300 ${
          isFormVisible || isSubmitted
            ? "opacity-0 pointer-events-none translate-y-4"
            : "opacity-100 pointer-events-auto translate-y-0"
        }`}
      >
        <button
          onClick={scrollToForm}
          className="w-full bg-white text-black font-bold py-4 px-6 rounded-xl shadow-2xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
        >
          <span>RSVP Now</span>
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

