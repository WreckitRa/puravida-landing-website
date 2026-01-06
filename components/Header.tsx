"use client";

import Link from "next/link";
import Image from "next/image";
import { getWhoInvited } from "@/lib/storage";
import { trackButtonClick } from "@/lib/analytics";
import packageJson from "../package.json";

interface HeaderProps {
  showInviteBanner?: boolean;
  className?: string;
  inviterName?: string; // Optional prop to override localStorage
}

export default function Header({
  showInviteBanner = true,
  className = "",
  inviterName,
}: HeaderProps) {
  const storedWhoInvited = getWhoInvited();
  // Use prop if provided, otherwise fall back to localStorage
  const whoInvited = inviterName || storedWhoInvited;

  return (
    <header className={`relative z-10 px-4 pt-6 pb-4 ${className}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center animate-slide-in-right">
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0"
          onClick={() => trackButtonClick("Logo", 0, "header")}
        >
          <Image
            src="/assets/puravida-main-logo.png"
            alt="PuraVida Logo"
            width={150}
            height={50}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Right side: Version and Invite Banner */}
        <div className="flex items-center gap-4">
          {/* Version Number - Always visible */}
          <span className="text-white/30 text-xs font-mono">
            v{packageJson.version}
          </span>

          {/* Desktop Invite Banner */}
          {showInviteBanner && whoInvited && (
            <div className="hidden sm:block">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <span className="text-white text-sm font-bold">
                  <span className="text-red-400">{whoInvited}</span> has invited
                  you
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Invite Banner */}
      {showInviteBanner && whoInvited && (
        <div className="sm:hidden mt-4 animate-slide-in-right">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-center">
            <span className="text-white text-sm font-bold">
              <span className="text-red-400">{whoInvited}</span> has invited you
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
