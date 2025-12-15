"use client";

// Next.js static generation config
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

// React imports
import { useState, useEffect } from "react";

// Next.js imports
import Link from "next/link";

// Internal components
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Internal utilities
import { getInviteData, getApiData, encodeBase64 } from "@/lib/storage";
import { isMobile, redirectToAppStore } from "@/lib/app-linking";

interface UserData {
  first_name: string;
  wait_list_count: number;
  phone: string;
}

interface InviteData {
  invite?: string;
}

// Mock data for testing
const MOCK_USER_DATA: UserData = {
  first_name: "Alex",
  wait_list_count: 247,
  phone: "+971501234567",
};

const MOCK_INVITE_DATA: InviteData = {
  invite: encodeURIComponent("Sarah"),
};

export default function IHaveInvitePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareResult, setShareResult] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    // Redirect mobile users to app store immediately
    if (isMobile()) {
      redirectToAppStore();
      return;
    }

    // Load data from localStorage with backward compatibility (desktop only)
    try {
      const apiData = getApiData();
      if (apiData?.data) {
        setUserData(apiData.data);
      } else {
        // Use mock data if localStorage is empty
        console.log("📝 Using mock data for testing");
        setUserData(MOCK_USER_DATA);
      }

      const invite = getInviteData();
      if (invite) {
        setInviteData(invite);
      } else {
        // Use mock invite data if localStorage is empty
        setInviteData(MOCK_INVITE_DATA);
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      // Fallback to mock data on error
      setUserData(MOCK_USER_DATA);
      setInviteData(MOCK_INVITE_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Handle share functionality
  const handleShare = async () => {
    if (!userData) return;

    setIsSharing(true);

    try {
      // Encode both invite and phone (matching old v1 behavior)
      const encodedInvite = encodeBase64(userData.first_name);
      const encodedPhone = encodeBase64(userData.phone);

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://puravida.com";
      // Old page used home.html, new page uses / (landing page)
      const shareUrl = `${siteUrl}/?invite=${encodedInvite}|${encodedPhone}`;

      // Personalized invitation message
      const shareData = {
        title: "Join PuraVida - Dubai's Exclusive Nightlife Community",
        text: `Hey! 👋

${userData.first_name} invited you to join PuraVida - Dubai's most exclusive nightlife community! 🎉

Get access to:
❤️ Guest lists at 10+ top nightclubs
⭐ Priority bookings & up to 25% discounts at Dubai's best restaurants
🎉 Exclusive after-parties

Join me and unlock Dubai's inner circle! Use my invite link to get started:`,
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        setShareResult("success");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setShareResult("copied");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error sharing:", err);
        setShareResult("error");
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
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

      {/* Header with logo and invite banner */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-3xl w-full space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center animate-bounce-in">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl animate-scale-in">
                <svg
                  className="w-12 h-12 md:w-16 md:h-16 text-white"
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
              {/* Animated ring - subtle pulse effect */}
              <div className="absolute inset-0 rounded-full border-4 border-green-400/20 animate-pulse-slow"></div>
            </div>
          </div>

          {/* Main Content Card */}
          <div
            className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl animate-bounce-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-6 text-center">
              {/* Congratulations Message */}
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-black leading-tight">
                  <span
                    className="inline-block"
                    style={{
                      background:
                        "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Congratulations!
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-700 font-medium">
                  You can download the app and enter your invite code
                </p>
              </div>

              {/* Invite Heading with Gradient */}
              <div className="space-y-2 mt-6 mb-8">
                <h2
                  className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                  style={{
                    background:
                      "linear-gradient(to right, #E91180 0%, #EB1E44 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "HelveticaNeue, Arial, sans-serif",
                    letterSpacing: "0",
                  }}
                >
                  Get the App and subscribe
                </h2>
                <h2
                  className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                  style={{
                    background:
                      "linear-gradient(to right, #E91180 0%, #EB1E44 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "HelveticaNeue, Arial, sans-serif",
                    letterSpacing: "0",
                  }}
                >
                  to the goodlife!
                </h2>
              </div>

              {/* Share Button (matching old implementation) */}
              <div className="pt-6">
                <button
                  onClick={handleShare}
                  disabled={isSharing || !userData}
                  className="group w-full md:w-auto md:min-w-[300px] bg-black text-white px-12 py-5 text-lg font-bold tracking-wide hover:bg-gray-900 transition-all duration-300 rounded-2xl hover:scale-105 hover:shadow-2xl active:scale-100 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSharing ? (
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
                        Sharing...
                      </>
                    ) : (
                      "Invite Friends & Move Up 🚀"
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                </button>
              </div>

              {/* Share Result */}
              {shareResult && (
                <div className="pt-4 animate-fade-in space-y-3">
                  {shareResult === "success" && (
                    <div className="space-y-2">
                      <p className="text-green-600 font-medium">
                        Invitation shared successfully! 🎉
                      </p>
                      <p className="text-sm text-gray-600">
                        When your friend joins using your link, you&apos;ll
                        automatically move up 100 spots in the queue!
                      </p>
                    </div>
                  )}
                  {shareResult === "copied" && (
                    <div className="space-y-2">
                      <p className="text-green-600 font-medium">
                        Invite link copied to clipboard! 📋
                      </p>
                      <p className="text-sm text-gray-600">
                        Share it with your friends via any messaging app. Each
                        friend who joins moves you up 100 spots!
                      </p>
                    </div>
                  )}
                  {shareResult === "error" && (
                    <p className="text-red-600 font-medium">
                      Unable to share. Please try copying the link manually.
                    </p>
                  )}
                  {shareResult === "success" && (
                    <div className="pt-2">
                      <a
                        href="https://www.instagram.com/puravida__life/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-black hover:text-gray-700 font-medium transition-colors"
                      >
                        Follow us on Instagram
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* App Download Buttons */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 mt-8 max-w-md mx-auto">
                {/* Google Play Store Button */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.puravida.events"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="bg-black rounded-xl p-3 md:p-4 flex flex-col items-center justify-center shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-white/20">
                    <svg
                      className="w-6 h-6 mb-1"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    <div className="text-center">
                      <div className="text-white text-[10px] leading-tight font-normal">
                        GET IT ON
                      </div>
                      <div className="text-white text-base font-bold leading-tight">
                        Google Play
                      </div>
                    </div>
                  </div>
                </a>

                {/* Apple App Store Button */}
                <a
                  href="https://apps.apple.com/us/app/id6744160016"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="bg-black rounded-xl p-3 md:p-4 flex flex-col items-center justify-center shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-white/20">
                    <svg
                      className="w-6 h-6 mb-1 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <div className="text-center">
                      <div className="text-white text-[10px] leading-tight font-normal">
                        Download on the
                      </div>
                      <div className="text-white text-base font-bold leading-tight">
                        App Store
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Sponsor Logos */}
      <Footer variant="compact" />
    </div>
  );
}
