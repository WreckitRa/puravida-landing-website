"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { trackButtonClick } from "@/lib/analytics";
import StructuredData from "@/components/StructuredData";
import { decodeAndStoreInviteFromUrl, getWhoInvited } from "@/lib/storage";
import { initAppLinking } from "@/lib/app-linking";
import ContactModal from "@/components/ContactModal";
import { getProducts, type Product } from "@/lib/api";
import { APP_VERSION } from "@/lib/config";

function LandingPageContent() {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [whoInvited, setWhoInvited] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    // Initialize app deep linking (for mobile app redirects)
    initAppLinking();

    // Handle invite parameter from URL (base64 encoded format: invite=base64Name|base64Phone)
    const encodedInvite = searchParams.get("invite");
    if (encodedInvite) {
      const { invite } = decodeAndStoreInviteFromUrl(encodedInvite);
      if (invite) {
        setWhoInvited(invite);
      }
    } else {
      // If no invite in URL, check localStorage
      const storedInvite = getWhoInvited();
      if (storedInvite !== "PuraVida") {
        setWhoInvited(storedInvite);
      }
    }

    // Fade in animation - defer to avoid synchronous setState
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, [searchParams]);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      const result = await getProducts(1); // 1 = production Stripe
      if (result.success && result.data) {
        setProducts(result.data);
      }
      setProductsLoading(false);
    };
    fetchProducts();
  }, []);

  // Format price based on currency
  const formatPrice = (amount: number, currency: string = "usd") => {
    const currencySymbols: Record<string, string> = {
      usd: "$",
      aed: "AED ",
      eur: "€",
      gbp: "£",
    };
    const symbol =
      currencySymbols[currency.toLowerCase()] || currency.toUpperCase() + " ";
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Partner logos
  const partners = [
    { logo: "/assets/logo1.svg", alt: "Partner 1" },
    { logo: "/assets/logo2.svg", alt: "Partner 2" },
    { logo: "/assets/logo3.svg", alt: "Partner 3" },
    { logo: "/assets/logo4.svg", alt: "Partner 4" },
    { logo: "/assets/logo5.svg", alt: "Partner 5" },
    { logo: "/assets/logo6.svg", alt: "Partner 6" },
  ];

  // Structured Data for SEO
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://puravida.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PuraVida",
    description:
      "Dubai's most exclusive lifestyle membership offering access to VIP guestlists, priority tables, and curated parties",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Membership Inquiries",
      areaServed: "AE",
      availableLanguage: ["en", "ar"],
    },
    areaServed: {
      "@type": "City",
      name: "Dubai",
      containedIn: {
        "@type": "Country",
        name: "United Arab Emirates",
      },
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
          <div
            className="absolute top-40 right-10 w-72 h-72 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute -bottom-8 left-1/2 w-72 h-72 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Background overlay for mobile */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black"></div>
        </div>

        {/* Header */}
        <header
          className={`relative z-20 pt-6 pb-4 px-4 lg:px-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="block"
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
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-8">
                <a
                  href="#how-it-works"
                  className="text-white/80 hover:text-white transition-colors font-medium text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    trackButtonClick("What is PuraVida", 0, "nav");
                    const element = document.getElementById("how-it-works");
                    if (element) {
                      const headerOffset = 100;
                      const elementPosition =
                        element.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  What is PuraVida?
                </a>
                <a
                  href="#how-it-works"
                  className="text-white/80 hover:text-white transition-colors font-medium text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    trackButtonClick("How it works", 0, "nav");
                    const element = document.getElementById("how-it-works");
                    if (element) {
                      const headerOffset = 100;
                      const elementPosition =
                        element.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  How it works?
                </a>
                <a
                  href="#benefits"
                  className="text-white/80 hover:text-white transition-colors font-medium text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    trackButtonClick("Benefits", 0, "nav");
                    const element = document.getElementById("benefits");
                    if (element) {
                      const headerOffset = 100;
                      const elementPosition =
                        element.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  Benefits
                </a>
                <a
                  href="#memberships"
                  className="text-white/80 hover:text-white transition-colors font-medium text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    trackButtonClick("Memberships", 0, "nav");
                    const element = document.getElementById("memberships");
                    if (element) {
                      const headerOffset = 100;
                      const elementPosition =
                        element.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  Memberships
                </a>
              </nav>

              {/* Desktop CTA */}
              <div className="hidden lg:block">
                <Link
                  href="/onboarding"
                  className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                  onClick={() =>
                    trackButtonClick("Check Eligibility", 0, "header-cta")
                  }
                >
                  Check my eligibility
                </Link>
              </div>

              {/* Mobile Invitation Banner */}
              {whoInvited && (
                <div className="lg:hidden">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2">
                    <span className="text-white text-xs font-medium">
                      <span className="text-red-400 font-bold">
                        {whoInvited}
                      </span>{" "}
                      has invited you
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className={`relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-8 lg:pt-16 pb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Invitation Image (Desktop) */}
            <div className="hidden lg:block">
              <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
                <Image
                  src="/assets/phone-invite.png"
                  alt="PuraVida Invitation"
                  fill
                  className="object-contain rounded-3xl"
                  priority
                />
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-6 lg:space-y-8">
              {/* Invitation Banner (Desktop) */}
              {whoInvited && (
                <div className="hidden lg:block animate-fade-in">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 inline-block">
                    <span className="text-white text-sm font-medium">
                      <span className="text-red-400 font-bold">
                        {whoInvited}
                      </span>{" "}
                      has invited you
                    </span>
                  </div>
                </div>
              )}

              {/* Main Heading */}
              <div
                className="space-y-4 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Get on the
                  <br />
                  <span
                    className="bg-gradient-to-r from-[#E91180] to-[#EB1E44] bg-clip-text text-transparent"
                    style={{
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily:
                        "Helvetica Neue, Helvetica, Arial, sans-serif",
                    }}
                  >
                    Guest list!
                  </span>
                </h1>
              </div>

              {/* Description */}
              <div
                className="animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  PuraVida is an{" "}
                  <span className="font-bold text-white">invite-only</span> app
                  that gives you access to amazing experiences in the Dubai
                  music scene.
                </p>
              </div>

              {/* Subscribe CTA */}
              <div
                className="animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <p className="text-yellow-300 font-bold text-lg md:text-xl lg:text-2xl">
                  Subscribe to the good life...
                </p>
              </div>

              {/* Benefits List - Desktop */}
              <div
                id="benefits"
                className="hidden lg:block space-y-4 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🎫</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">
                        GUEST LIST:
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed mb-1">
                        Get yourself +2 on all guest lists
                      </p>
                      <p className="text-white/60 text-sm font-medium">
                        <span className="text-white font-bold">
                          6 nightclubs in Dubai
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">⭐</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">
                        PRIORITY BOOKINGS & DISCOUNTS:
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed mb-1">
                        Enjoy priority bookings and up to 25% discounts
                      </p>
                      <p className="text-white/60 text-sm font-medium">
                        in the{" "}
                        <span className="text-white font-bold">
                          TOP 50 Dubai restaurants
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🎉</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">
                        AFTER-PARTIES:
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        Access amazing after-parties in secret locations
                      </p>
                      <p className="text-white/60 text-sm font-medium mt-1">
                        <span className="text-white font-bold">
                          2 afters per month
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Timeline - Mobile */}
              <div
                className="lg:hidden space-y-4 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="font-bold text-white mb-2">
                    Guest List Access:
                  </div>
                  <div className="text-white/80 text-sm">
                    Get yourself +2 on all guest lists
                    <br />
                    <span className="text-white font-bold">
                      8 of the trendiest nightclubs in Dubai
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="font-bold text-white mb-2">
                    Priority Bookings & Discounts:
                  </div>
                  <div className="text-white/80 text-sm">
                    Enjoy priority bookings and up to 25% discounts
                    <br />
                    <span className="text-white font-bold">
                      in the TOP 50 Dubai restaurants
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="font-bold text-white mb-2">
                    Secret After-Parties:
                  </div>
                  <div className="text-white/80 text-sm">
                    Access amazing after-parties in secret locations
                    <br />
                    <span className="text-white font-bold">
                      2 afters per month
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="space-y-4 animate-fade-in"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/ihaveinvite"
                    className="group bg-white text-black px-6 py-4 text-center font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-100"
                    onClick={() =>
                      trackButtonClick("I have an invite", 0, "cta")
                    }
                  >
                    I have an invite
                  </Link>
                  <Link
                    href="/onboarding"
                    className="group bg-white text-black px-6 py-4 text-center font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-100"
                    onClick={() =>
                      trackButtonClick("Request an invite", 0, "cta")
                    }
                  >
                    Request an invite
                  </Link>
                </div>

                <p className="text-white/60 text-xs text-center">
                  By continuing you are agreeing to our{" "}
                  <Link
                    href="/terms-conditions"
                    className="text-white underline hover:text-white/80"
                  >
                    Terms and Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Partner Logos - Mobile */}
          <div
            className="lg:hidden mt-12 animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="grid grid-cols-6 gap-2">
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center bg-white/5 border border-white/10 rounded-lg p-2 aspect-square"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.alt}
                    width={40}
                    height={40}
                    className="max-w-full max-h-full object-contain brightness-0 invert opacity-60"
                  />
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-32 scroll-mt-24"
        >
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              How it works?
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
              Join Dubai&apos;s most exclusive lifestyle membership in three
              simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 animate-fade-in">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E91180] to-[#EB1E44] rounded-full flex items-center justify-center mx-auto text-3xl font-bold text-white mb-4">
                  1
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Check Your Eligibility
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Complete our quick 2-minute application to see if you&apos;re
                  a fit for the PuraVida community
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E91180] to-[#EB1E44] rounded-full flex items-center justify-center mx-auto text-3xl font-bold text-white mb-4">
                  2
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Get Approved
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Our concierge team reviews your application and reaches out
                  within 24 hours
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E91180] to-[#EB1E44] rounded-full flex items-center justify-center mx-auto text-3xl font-bold text-white mb-4">
                  3
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Start Living the Good Life
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Access exclusive guestlists, priority bookings, and
                  after-parties at Dubai&apos;s hottest venues
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/onboarding"
              className="inline-block bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105"
              onClick={() =>
                trackButtonClick("Get Started CTA", 0, "how-it-works")
              }
            >
              Get Started Now 🚀
            </Link>
          </div>
        </section>

        {/* Benefits Section */}
        <section
          id="benefits"
          className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-32 bg-white/5 backdrop-blur-sm scroll-mt-24"
        >
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Benefits
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
              Everything you need to experience Dubai&apos;s nightlife at its
              finest
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Guest List Benefit */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-white/10 transition-all duration-300 animate-fade-in">
              <div className="text-5xl mb-4">🎫</div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                GUEST LIST ACCESS
              </h3>
              <p className="text-white/80 text-sm lg:text-base leading-relaxed mb-3">
                Get yourself +2 on all guest lists at Dubai&apos;s most
                exclusive nightclubs
              </p>
              <p className="text-white/60 text-sm font-medium">
                <span className="text-white font-bold">
                  6+ nightclubs in Dubai
                </span>
              </p>
            </div>

            {/* Priority Bookings Benefit */}
            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-white/10 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                PRIORITY BOOKINGS & DISCOUNTS
              </h3>
              <p className="text-white/80 text-sm lg:text-base leading-relaxed mb-3">
                Enjoy priority bookings and up to 25% discounts at Dubai&apos;s
                top restaurants
              </p>
              <p className="text-white/60 text-sm font-medium">
                in the{" "}
                <span className="text-white font-bold">
                  TOP 50 Dubai restaurants
                </span>
              </p>
            </div>

            {/* After-Parties Benefit */}
            <div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-white/10 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                EXCLUSIVE AFTER-PARTIES
              </h3>
              <p className="text-white/80 text-sm lg:text-base leading-relaxed mb-3">
                Access amazing after-parties in secret locations across Dubai
              </p>
              <p className="text-white/60 text-sm font-medium">
                <span className="text-white font-bold">2 afters per month</span>
              </p>
            </div>
          </div>
        </section>

        {/* Memberships Section */}
        <section
          id="memberships"
          className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-32 scroll-mt-24"
        >
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Memberships
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
              Choose the plan that works for you. Save more with annual
              membership
            </p>
          </div>

          {productsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="mt-4 text-white/60 font-medium">
                Loading pricing...
              </p>
            </div>
          ) : (
            <>
              {/* Discount Message Banner - Show once for both memberships */}
              {(() => {
                const firstProduct = products.find((p) => p.offer_message);
                const offerMessage = firstProduct?.offer_message;

                return offerMessage ? (
                  <div className="max-w-5xl mx-auto mb-8 animate-fade-in">
                    <div className="bg-gradient-to-r from-[#E91180]/30 to-[#EB1E44]/30 border border-[#E91180]/50 rounded-xl p-4 md:p-6">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl md:text-3xl">🎉</span>
                        <p className="text-white font-bold text-base md:text-lg text-center">
                          {offerMessage}
                        </p>
                        <span className="text-2xl md:text-3xl">✨</span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                {/* Male Membership */}
                {(() => {
                  const maleProduct = products.find(
                    (p) => p.monthly?.male || p.yearly?.male
                  );
                  const currency = maleProduct?.currency_type || "aed";
                  const monthly = maleProduct?.monthly?.male;
                  const yearly = maleProduct?.yearly?.male;

                  return (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 lg:p-10 hover:bg-white/10 transition-all duration-300 animate-fade-in">
                      <div className="text-center space-y-6">
                        <div className="text-5xl mb-4">👔</div>
                        <h3 className="text-3xl font-bold text-white mb-2">
                          Male
                        </h3>

                        <div className="space-y-4">
                          {/* Monthly Plan */}
                          {monthly && (
                            <div className="bg-white/10 rounded-xl p-6 relative">
                              {monthly.original_price && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  SALE{" "}
                                  {Math.round(
                                    ((parseFloat(monthly.original_price) -
                                      monthly.amount) /
                                      parseFloat(monthly.original_price)) *
                                      100
                                  )}
                                  % OFF
                                </div>
                              )}
                              <div className="text-white/60 text-sm mb-1">
                                Monthly
                              </div>
                              <div className="flex items-baseline justify-center gap-2 flex-wrap">
                                {monthly.original_price && (
                                  <span className="text-xl text-white/40 line-through">
                                    {formatPrice(
                                      parseFloat(monthly.original_price),
                                      currency
                                    )}
                                  </span>
                                )}
                                <div className="text-4xl font-bold text-white">
                                  {formatPrice(monthly.amount, currency)}
                                </div>
                              </div>
                              <div className="text-white/60 text-xs mt-1">
                                per month
                              </div>
                            </div>
                          )}

                          {/* Annual Plan */}
                          {yearly && monthly && (
                            <div className="bg-gradient-to-br from-[#E91180]/20 to-[#EB1E44]/20 border border-[#E91180]/30 rounded-xl p-6 relative">
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E91180] to-[#EB1E44] text-white text-xs font-bold px-4 py-1 rounded-full">
                                BEST VALUE
                              </div>
                              <div className="text-white/60 text-sm mb-1">
                                Annual
                              </div>
                              <div className="flex items-baseline justify-center gap-2 flex-wrap">
                                {yearly.original_price && (
                                  <span className="text-xl text-white/40 line-through">
                                    {formatPrice(
                                      parseFloat(yearly.original_price),
                                      currency
                                    )}
                                  </span>
                                )}
                                <div className="text-4xl font-bold text-white">
                                  {formatPrice(yearly.amount, currency)}
                                </div>
                              </div>
                              <div className="text-white/60 text-xs mt-1">
                                per year
                              </div>
                              <div className="mt-2 text-green-400 text-sm font-medium">
                                Save{" "}
                                {Math.round(
                                  ((monthly.amount * 12 - yearly.amount) /
                                    (monthly.amount * 12)) *
                                    100
                                )}
                                % vs monthly
                              </div>
                            </div>
                          )}
                        </div>
                        <Link
                          href="/onboarding"
                          className="block w-full bg-white text-black px-6 py-4 rounded-xl font-bold text-center hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            trackButtonClick(
                              "Join Male Membership",
                              0,
                              "memberships"
                            )
                          }
                        >
                          Join Now
                        </Link>
                      </div>
                    </div>
                  );
                })()}

                {/* Female Membership */}
                {(() => {
                  const femaleProduct = products.find(
                    (p) => p.monthly?.female || p.yearly?.female
                  );
                  const currency = femaleProduct?.currency_type || "aed";
                  const monthly = femaleProduct?.monthly?.female;
                  const yearly = femaleProduct?.yearly?.female;

                  return (
                    <div
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 lg:p-10 hover:bg-white/10 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: "0.1s" }}
                    >
                      <div className="text-center space-y-6">
                        <div className="text-5xl mb-4">👗</div>
                        <h3 className="text-3xl font-bold text-white mb-2">
                          Female
                        </h3>

                        <div className="space-y-4">
                          {/* Monthly Plan */}
                          {monthly && (
                            <div className="bg-white/10 rounded-xl p-6 relative">
                              {monthly.original_price && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  SALE{" "}
                                  {Math.round(
                                    ((parseFloat(monthly.original_price) -
                                      monthly.amount) /
                                      parseFloat(monthly.original_price)) *
                                      100
                                  )}
                                  % OFF
                                </div>
                              )}
                              <div className="text-white/60 text-sm mb-1">
                                Monthly
                              </div>
                              <div className="flex items-baseline justify-center gap-2 flex-wrap">
                                {monthly.original_price && (
                                  <span className="text-xl text-white/40 line-through">
                                    {formatPrice(
                                      parseFloat(monthly.original_price),
                                      currency
                                    )}
                                  </span>
                                )}
                                <div className="text-4xl font-bold text-white">
                                  {formatPrice(monthly.amount, currency)}
                                </div>
                              </div>
                              <div className="text-white/60 text-xs mt-1">
                                per month
                              </div>
                            </div>
                          )}

                          {/* Annual Plan */}
                          {yearly && monthly && (
                            <div className="bg-gradient-to-br from-[#E91180]/20 to-[#EB1E44]/20 border border-[#E91180]/30 rounded-xl p-6 relative">
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E91180] to-[#EB1E44] text-white text-xs font-bold px-4 py-1 rounded-full">
                                BEST VALUE
                              </div>
                              <div className="text-white/60 text-sm mb-1">
                                Annual
                              </div>
                              <div className="flex items-baseline justify-center gap-2 flex-wrap">
                                {yearly.original_price && (
                                  <span className="text-xl text-white/40 line-through">
                                    {formatPrice(
                                      parseFloat(yearly.original_price),
                                      currency
                                    )}
                                  </span>
                                )}
                                <div className="text-4xl font-bold text-white">
                                  {formatPrice(yearly.amount, currency)}
                                </div>
                              </div>
                              <div className="text-white/60 text-xs mt-1">
                                per year
                              </div>
                              <div className="mt-2 text-green-400 text-sm font-medium">
                                Save{" "}
                                {Math.round(
                                  ((monthly.amount * 12 - yearly.amount) /
                                    (monthly.amount * 12)) *
                                    100
                                )}
                                % vs monthly
                              </div>
                            </div>
                          )}
                        </div>
                        <Link
                          href="/onboarding"
                          className="block w-full bg-white text-black px-6 py-4 rounded-xl font-bold text-center hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            trackButtonClick(
                              "Join Female Membership",
                              0,
                              "memberships"
                            )
                          }
                        >
                          Join Now
                        </Link>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          <div className="text-center mt-12">
            <p className="text-white/60 text-sm">
              All memberships include full access to all benefits. Cancel
              anytime.
            </p>
          </div>
        </section>

        {/* Footer - Desktop */}
        <footer className="hidden lg:block relative z-10 border-t border-white/10 mt-20">
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
                <p className="text-white/40 text-xs mt-4">v{APP_VERSION}</p>
              </div>

              {/* Footer Navigation */}
              <nav className="flex items-center justify-center gap-6 pt-6">
                <Link
                  href="/privacy-policy"
                  className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                  onClick={() =>
                    trackButtonClick("Privacy Policy", 0, "footer")
                  }
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
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  );
}
