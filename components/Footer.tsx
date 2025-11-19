"use client";

import Link from "next/link";
import Image from "next/image";
import { trackButtonClick } from "@/lib/analytics";
import { useState } from "react";
import ContactModal from "./ContactModal";

interface FooterProps {
  variant?: "default" | "compact";
  className?: string;
}

export default function Footer({
  variant = "default",
  className = "",
}: FooterProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Partner logos
  const partners = [
    { logo: "/assets/logo1.svg", alt: "Partner 1" },
    { logo: "/assets/logo2.svg", alt: "Partner 2" },
    { logo: "/assets/logo3.svg", alt: "Partner 3" },
    { logo: "/assets/logo4.svg", alt: "Partner 4" },
    { logo: "/assets/logo5.svg", alt: "Partner 5" },
    { logo: "/assets/logo6.svg", alt: "Partner 6" },
  ];

  if (variant === "compact") {
    return (
      <>
        <footer
          className={`relative z-10 bg-white/5 backdrop-blur-sm border-t border-white/10 py-8 mt-12 ${className}`}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-6">
              <p className="text-white/70 text-sm mb-6 font-medium">
                In partnership with
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 items-center justify-items-center max-w-4xl mx-auto">
                {partners.map((partner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-lg p-2 sm:p-3 hover:bg-white/10 transition-all duration-300"
                  >
                    <Image
                      src={partner.logo}
                      alt={partner.alt}
                      width={60}
                      height={60}
                      className="max-w-full max-h-full object-contain brightness-0 invert opacity-60"
                    />
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
                trademarks of PuraVida Inc. All other trademarks are the
                property of their respective owners.
              </p>
            </div>
          </div>
        </footer>
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <footer
        className={`hidden lg:block relative z-10 border-t border-white/10 mt-20 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Partners Section */}
          <div className="mb-12">
            <div className="grid grid-cols-7 gap-8 items-center">
              <div className="col-span-2">
                <div className="text-white/60 text-sm font-medium mb-4">
                  In partnership with
                </div>
              </div>
              <div className="col-span-5 grid grid-cols-6 gap-4">
                {partners.map((partner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center bg-white/5 border border-white/10 rounded-lg p-4 aspect-square hover:bg-white/10 transition-all duration-300"
                  >
                    <Image
                      src={partner.logo}
                      alt={partner.alt}
                      width={60}
                      height={60}
                      className="max-w-full max-h-full object-contain brightness-0 invert opacity-60"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legal Section */}
          <div className="border-t border-white/10 pt-8 space-y-4">
            <div className="text-white/60 text-sm space-y-2">
              <p>&copy; 2024 PuraVida Inc. All rights reserved.</p>
              <p>PuraVida Inc. is a Delaware corporation.</p>
              <p>
                PuraVida™ and the PuraVida logo are trademarks or registered
                trademarks of PuraVida Inc. All other trademarks are the
                property of their respective owners
              </p>
            </div>

            {/* Footer Navigation */}
            <nav className="flex items-center justify-center gap-6 pt-6">
              <Link
                href="/privacy-policy"
                className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                onClick={() => trackButtonClick("Privacy Policy", 0, "footer")}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-conditions"
                className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                onClick={() =>
                  trackButtonClick("Terms of Service", 0, "footer")
                }
              >
                Terms of Service
              </Link>
              <Link
                href="/cookie-policy"
                className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                onClick={() => trackButtonClick("Cookie Policy", 0, "footer")}
              >
                Cookie Policy
              </Link>
              <button
                onClick={() => {
                  trackButtonClick("Contact Us", 0, "footer");
                  setIsContactModalOpen(true);
                }}
                className="text-white/60 hover:text-white transition-colors text-sm font-medium cursor-pointer"
              >
                Contact Us
              </button>
            </nav>
          </div>
        </div>
      </footer>
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}
