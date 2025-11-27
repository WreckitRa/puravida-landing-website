"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEmailClick = () => {
    trackEvent("contact_method_selected", {
      method: "email",
      contact_type: "footer_modal",
    });
    window.location.href = "mailto:hello@thisispuravida.com";
  };

  const handleWhatsAppClick = () => {
    trackEvent("contact_method_selected", {
      method: "whatsapp",
      contact_type: "footer_modal",
    });
    // Open WhatsApp with the phone number
    const phoneNumber = "971526782867"; // Remove spaces and + for WhatsApp URL
    window.open(`https://wa.me/${phoneNumber}`, "_blank");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 pointer-events-none">
        <div
          className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl max-w-md w-full relative pointer-events-auto animate-bounce-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors p-2"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Modal Content */}
          <div className="space-y-6 text-center">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E91180] to-[#EB1E44] flex items-center justify-center shadow-lg">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-black">
                Get in Touch
              </h2>
              <p className="text-gray-600 text-lg font-medium">
                Choose how you&apos;d like to contact us
              </p>
            </div>

            {/* Contact Options */}
            <div className="space-y-4 pt-4">
              {/* Email Option - Hidden, not active yet */}
              {/* <button
                onClick={handleEmailClick}
                className="group w-full bg-black text-white px-6 py-5 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-100 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Email Us
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              </button> */}

              {/* WhatsApp Option */}
              <button
                onClick={handleWhatsAppClick}
                className="group w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-6 py-5 rounded-2xl font-bold text-lg hover:from-[#2EE672] hover:to-[#1AB394] transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-100 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp Us
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              </button>
            </div>

            {/* Contact Info Display */}
            <div className="pt-4 space-y-2 text-sm text-gray-600">
              {/* Email hidden - not active yet */}
              {/* <p className="font-medium">hello@thisispuravida.com</p> */}
              <p className="font-medium">+971 52 678 2867</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
