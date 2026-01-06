"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import PhoneCodeSelector from "@/components/PhoneCodeSelector";
import { trackEvent, trackButtonClick } from "@/lib/analytics";

interface HousePartyClientProps {
  inviterName: string;
}

export default function HousePartyClient({ inviterName }: HousePartyClientProps) {
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

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Track page view
    trackEvent("house_party_page_viewed", {
      inviter_name: inviterName,
    });
  }, [inviterName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsDuplicate(false);

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

    setIsSubmitting(true);

    trackEvent("house_party_rsvp_submit_attempt", {
      inviter_name: inviterName,
    });

    try {
      const response = await fetch("/api/house-party-rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviterName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          countryCode,
          email: email.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (response.status === 409 || result.duplicate) {
        setIsDuplicate(true);
        setError("You have already RSVP'd for this event");
        trackEvent("house_party_rsvp_duplicate", {
          inviter_name: inviterName,
        });
      } else if (!response.ok || !result.success) {
        setError(result.message || "Failed to submit RSVP. Please try again.");
        trackEvent("house_party_rsvp_error", {
          inviter_name: inviterName,
          error_message: result.message,
        });
      } else {
        setIsSubmitted(true);
        setFirstName("");
        setLastName("");
        setPhone("");
        setEmail("");
        trackEvent("house_party_rsvp_success", {
          inviter_name: inviterName,
        });
      }
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      setError("Network error. Please try again.");
      trackEvent("house_party_rsvp_network_error", {
        inviter_name: inviterName,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Event details (you can make this dynamic later)
  const eventDetails = {
    title: "Exclusive House Party",
    date: "Saturday, March 15, 2025",
    time: "8:00 PM - 2:00 AM",
    location: "Private Residence, Dubai",
    description: "Join us for an unforgettable night of music, great vibes, and amazing company. This exclusive house party is by invitation only.",
    dressCode: "Smart Casual",
  };

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
      <Header />

      {/* Main Content */}
      <main
        className={`relative z-10 w-full max-w-7xl mx-auto lg:px-8 pt-8 lg:pt-16 pb-24 lg:pb-16 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 w-full lg:items-center">
          {/* Left Column - Event Banner & Details */}
          <div className="space-y-6 animate-slide-in-right w-full">
            {/* Invitation Banner */}
            <div className="bg-gradient-to-r from-[#E91180]/20 to-[#EB1E44]/20 border-2 border-[#E91180]/30 rounded-2xl p-6 backdrop-blur-sm">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                <span className="text-[#E91180]">{inviterName}</span> is inviting you
              </h1>
              <p className="text-white/80 text-lg">
                to an exclusive house party in Dubai
              </p>
            </div>

            {/* Event Banner Image Placeholder */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#E91180]/20 to-[#EB1E44]/20 border-2 border-white/10 rounded-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎉</div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">
                    {eventDetails.title}
                  </h2>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
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
                    <p className="text-white/60 text-sm">Date & Time</p>
                    <p className="text-white font-medium">{eventDetails.date}</p>
                    <p className="text-white font-medium">{eventDetails.time} <span className="text-white/60 text-sm">(Dubai time)</span></p>
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-white/60 text-sm">Location</p>
                    <p className="text-white font-medium">{eventDetails.location}</p>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-white/60 text-sm">Dress Code</p>
                    <p className="text-white font-medium">{eventDetails.dressCode}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-white/80 text-sm leading-relaxed">
                  {eventDetails.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - RSVP Form */}
          <div className="space-y-6 animate-slide-in-right w-full lg:self-center">
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

                  <div className="text-center space-y-2">
                    <h3 className="text-2xl lg:text-3xl font-bold text-black">
                      You&apos;re on the list! 🎉
                    </h3>
                    <p className="text-black/70 text-sm">
                      We&apos;ll send you the exact location and details closer to the event date.
                    </p>
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
                          type="text"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                          className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-200 text-sm"
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-base"
                      onClick={() => {
                        trackButtonClick("RSVP Submit", 0, "house-party");
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
    </div>
  );
}


