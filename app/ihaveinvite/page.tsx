"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const whoInvited = inviteData?.invite
    ? decodeURIComponent(inviteData.invite)
    : "PuraVida";

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
      <div className="relative z-10 px-4 pt-6 pb-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center animate-slide-in-right">
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
        <div className="sm:hidden mt-4 animate-slide-in-right">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-center">
            <span className="text-white text-sm font-bold">
              <span className="text-red-400">{whoInvited}</span> has invited you
            </span>
          </div>
        </div>
      </div>

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
                      className="w-6 h-6 mb-1"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.05,20.28C16.07,21.28 14.87,21.47 13.67,21.47C12.5,21.47 11.33,21.28 10.35,20.28C9.37,19.29 9.19,18.09 9.19,16.89C9.19,15.73 9.37,14.56 10.35,13.58C11.33,12.6 12.5,12.42 13.67,12.42C14.87,12.42 16.07,12.6 17.05,13.58C18.03,14.56 18.22,15.73 18.22,16.89C18.22,18.09 18.03,19.29 17.05,20.28M12.97,3.92C13.55,3.34 14.22,3.15 15,3.35C15.78,3.56 16.33,4.11 16.67,4.78C17,5.45 17.11,6.22 16.89,7C16.67,7.78 16.11,8.33 15.44,8.67C14.78,9 14,9.11 13.22,8.89C12.44,8.67 11.89,8.11 11.56,7.44C11.22,6.78 11.11,6 11.33,5.22C11.56,4.44 12.11,3.89 12.78,3.56C12.85,3.5 12.91,3.45 12.97,3.92M5.19,8.89C4.22,9.87 3.64,11.11 3.64,12.5C3.64,13.87 4.22,15.11 5.19,16.08C6.16,17.05 7.4,17.64 8.78,17.64C10.15,17.64 11.39,17.05 12.36,16.08C13.33,15.11 13.92,13.87 13.92,12.5C13.92,11.11 13.33,9.87 12.36,8.89C11.39,7.92 10.15,7.33 8.78,7.33C7.4,7.33 6.16,7.92 5.19,8.89Z" />
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
      <footer className="relative z-10 bg-white/5 backdrop-blur-sm border-t border-white/10 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-white/70 text-sm mb-6 font-medium">
              In partnership with
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 items-center justify-items-center max-w-4xl mx-auto">
              {/* Sponsor logos placeholder - replace with actual images when available */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
                >
                  <span className="text-white/30 text-xs font-medium">
                    Logo {i}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center pt-6 border-t border-white/10 mt-6">
            <p className="text-white/50 text-xs">
              &copy; 2024 PuraVida Inc. All rights reserved.
            </p>
            <p className="text-white/40 text-xs mt-1">
              PuraVida Inc. is a Delaware corporation.
            </p>
            <p className="text-white/30 text-xs mt-2">
              PuraVida™ and the PuraVida logo are trademarks or registered
              trademarks of PuraVida Inc. All other trademarks are the property
              of their respective owners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
