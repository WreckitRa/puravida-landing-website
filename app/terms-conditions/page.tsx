"use client";

// Next.js static generation config
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

// Next.js imports
import Link from "next/link";

export default function TermsConditionsPage() {
  return (
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

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Terms and Conditions
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-medium">
              Please read the terms carefully before using our service
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl animate-bounce-in">
          <div className="space-y-8">
            {/* Introduction */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-black">
                PuraVida App Terms of Service
              </h1>
            </div>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                1. Acceptance of Terms
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                By accessing or using the PuraVida mobile application ("App"),
                you agree to comply with and be bound by these Terms of Service
                ("Terms"). If you do not agree with any part of these Terms,
                please do not use the App.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                2. Services Provided
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                PuraVida offers users the ability to:
              </p>
              <ul className="space-y-3 ml-8 list-disc text-gray-700">
                <li>
                  Add themselves and up to two guests to the guest lists of our
                  partnering venues.
                </li>
                <li>Receive discounts when booking through our platform.</li>
                <li>
                  Search and discover events and activities within the nightlife
                  scene.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                3. Membership and Fees
              </h2>
              <ul className="space-y-3 ml-4 list-disc text-gray-700">
                <li>
                  <strong>Membership Requirement:</strong> Access to certain
                  features and services within the App requires an active
                  membership.
                </li>
                <li>
                  <strong>Fees:</strong> Membership fees are outlined within the
                  App and are subject to change. All fees are non-refundable
                  unless stated otherwise.
                </li>
                <li>
                  <strong>Payment Terms:</strong> By subscribing, you authorize
                  PuraVida to charge the applicable membership fee to your
                  provided payment method.
                </li>
                <li>
                  <strong>Renewal:</strong> Memberships may automatically renew
                  at the end of their term unless canceled prior to renewal.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                4. Guest List and Venue Policies
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                While PuraVida facilitates guest list additions, please note:
              </p>
              <ul className="space-y-3 ml-8 list-disc text-gray-700">
                <li>
                  <strong>Venue Discretion:</strong> Partnering venues reserve
                  the right to refuse entry to individuals on the guest list.
                  Admission policies, including dress codes and age
                  restrictions, are determined solely by the venues.
                </li>
                <li>
                  <strong>No-Show Policy:</strong> Users who fail to attend a
                  booked event without prior cancellation on three separate
                  occasions may face penalties, including but not limited to
                  temporary suspension of booking privileges.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                5. User Responsibilities
              </h2>
              <ul className="space-y-3 ml-4 list-disc text-gray-700">
                <li>
                  Provide accurate and current information when using the App.
                </li>
                <li>Abide by the rules and policies of partnering venues.</li>
                <li>
                  Respect the rights and experiences of other patrons and venue
                  staff.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                6. Limitation of Liability
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                PuraVida acts as an intermediary between users and partnering
                venues. We are not responsible for:
              </p>
              <ul className="space-y-3 ml-8 list-disc text-gray-700">
                <li>
                  The actions or policies of any venue, including refusal of
                  entry or service.
                </li>
                <li>
                  Any personal injury, property damage, or other incidents
                  occurring at a venue.
                </li>
                <li>The accuracy of event information provided by venues.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                7. Modifications to Terms
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                PuraVida reserves the right to modify these Terms at any time.
                Users will be notified of significant changes through the App or
                via email. Continued use of the App after such modifications
                constitutes acceptance of the revised Terms.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                8. Termination
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                PuraVida may suspend or terminate a user's access to the App for
                violations of these Terms or any other conduct deemed harmful to
                the App or its users.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                9. Governing Law
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                These Terms shall be governed and construed in accordance with
                the laws of the United States, without regard to its conflict of
                law provisions.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                10. Contact Information
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                For questions or concerns regarding these Terms, please contact
                us at{" "}
                <a
                  href="mailto:hello@thisispuravida.com"
                  className="text-black underline hover:text-gray-700 font-medium"
                >
                  hello@thisispuravida.com
                </a>
                .
              </p>
            </section>

            {/* Conclusion */}
            <div className="space-y-4 pt-4 border-t border-gray-200 mt-8">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium">
                By using the PuraVida App, you acknowledge that you have read,
                understood, and agree to these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/70 text-sm md:text-base font-medium">
            &copy; 2025 PuraVida. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
