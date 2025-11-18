"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trackButtonClick, trackConversion } from "@/lib/analytics";

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

export default function CongratulationPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [shareResult, setShareResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    try {
      const apiDataStr = localStorage.getItem("apiData");
      const inviteStr = localStorage.getItem("invite");

      if (apiDataStr) {
        const { data } = JSON.parse(apiDataStr);
        setUserData(data);
      } else {
        // Use mock data if localStorage is empty
        console.log("📝 Using mock data for testing");
        setUserData(MOCK_USER_DATA);
      }

      if (inviteStr) {
        const invite = JSON.parse(inviteStr);
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

  const encodeBase64 = (str: string): string => {
    if (typeof window === "undefined") return "";
    return btoa(unescape(encodeURIComponent(str)));
  };

  const handleShare = async () => {
    if (!userData) return;

    setIsSharing(true);
    trackButtonClick("Invite & Move up", 0, "share");

    try {
      // Encode both invite and phone
      const encodedInvite = encodeBase64(userData.first_name);
      const encodedPhone = encodeBase64(userData.phone);

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://puravida.com";
      const shareUrl = `${siteUrl}/onboarding?invite=${encodedInvite}|${encodedPhone}`;

      const shareData = {
        title: "PuraVida Invitation",
        text: `Hey… I just added myself to the guestlist of this new place called Euphoria… it's this Friday, the 11th April! 

It's a jungle beach party at La Maison de la Plage… right next to SurfClub on the Palm. The DJs are really good… check out their lineup: ABLA, HOOMANCE b2b MILI and BAKH. 

Here's the guestlist link:`,
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        setShareResult("success");
        trackConversion({ action: "share_success" }, 0);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md">
          <h2 className="text-2xl font-bold text-black mb-4">No data found</h2>
          <p className="text-gray-600 mb-6">
            Please complete the onboarding process first.
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-900 transition-colors"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    );
  }

  const whoInvited = inviteData?.invite
    ? decodeURIComponent(inviteData.invite)
    : "PuraVida";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
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

      <div className="max-w-3xl w-full space-y-8 relative z-10">
        {/* Header with logo and invite banner */}
        <div className="flex justify-between items-center mb-8 animate-slide-in-right">
          <Link
            href="/"
            className="text-white text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            PuraVida
          </Link>
          <div className="hidden sm:block">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <span className="text-white text-sm font-bold">
                <span className="text-red-400">{whoInvited}</span> has invited
                you
              </span>
            </div>
          </div>
        </div>

        {/* Mobile invite banner */}
        <div className="sm:hidden mb-6 animate-slide-in-right">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-center">
            <span className="text-white text-sm font-bold">
              <span className="text-red-400">{whoInvited}</span> has invited you
            </span>
          </div>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center animate-bounce-in">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center shadow-2xl animate-scale-in">
            <div className="text-5xl md:text-7xl">✨</div>
          </div>
        </div>

        {/* Main Content Card */}
        <div
          className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl animate-bounce-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="space-y-6 text-center">
            {/* Success Message */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">
                Awesome! 🎉
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 font-bold">
                Your profile is under review.
              </p>
            </div>

            {/* Invite Heading with Gradient */}
            <div className="space-y-2 mt-6 mb-6">
              <h2
                className="text-3xl md:text-4xl font-bold leading-tight"
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
                Invite your Crew to get
              </h2>
              <h2
                className="text-3xl md:text-4xl font-bold leading-tight"
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
                bumped on the Queue
              </h2>
            </div>

            {/* Waitlist Position */}
            <div className="space-y-3 py-6">
              <p className="text-lg md:text-xl text-gray-700 font-medium">
                You&apos;re currently at{" "}
                <span className="text-black font-bold text-2xl md:text-3xl">
                  #{userData.wait_list_count}
                </span>
              </p>
              <p className="text-base md:text-lg text-gray-600 font-medium">
                For every person you invite, you jump 100 spots on the list
              </p>
            </div>

            {/* Share Button */}
            <div className="pt-6">
              <button
                onClick={handleShare}
                disabled={isSharing}
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
                    <>
                      Invite & Move up 🚀
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
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              </button>
            </div>

            {/* Share Result */}
            {shareResult && (
              <div className="pt-4 animate-fade-in">
                {shareResult === "success" && (
                  <p className="text-green-600 font-medium">
                    Shared successfully! 🎉
                  </p>
                )}
                {shareResult === "copied" && (
                  <p className="text-green-600 font-medium">
                    Link copied to clipboard! 📋
                  </p>
                )}
                {shareResult === "error" && (
                  <p className="text-red-600 font-medium">
                    Error sharing. Please try again.
                  </p>
                )}
                {shareResult === "success" && (
                  <div className="mt-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
