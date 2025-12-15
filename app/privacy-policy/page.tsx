"use client";

// Next.js imports
import Link from "next/link";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-medium">
              Please read the privacy policy carefully before using our service
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
                PuraVida App Privacy Policy
              </h1>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Welcome to PuraVida ("<strong>we</strong>," "<strong>us</strong>
                ," or "<strong>our</strong>"). This Privacy Policy describes how
                PuraVida collects, uses, and shares information about you when
                you use our mobile application ("<strong>App</strong>"), our
                website (
                <a
                  href="https://www.puravida.events/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline hover:text-gray-700 font-medium"
                >
                  www.puravida.events
                </a>
                ), or any other services that link to this policy (collectively,
                the "<strong>Services</strong>").
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                By accessing or using our Services, you agree to this Privacy
                Policy. If you do not agree, please do not use our Services.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                1. Information We Collect
              </h2>

              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                    1.1 Information You Provide to Us
                  </h3>
                  <ul className="space-y-3 ml-4 list-disc text-gray-700">
                    <li>
                      <strong>Account Information:</strong> When you create an
                      account, we may collect details such as your name, email
                      address, phone number, gender, username, password, and any
                      additional information you choose to provide.
                    </li>
                    <li>
                      <strong>Profile Information:</strong> You may optionally
                      provide a profile photo, location preferences, or other
                      details to enhance your experience within the App.
                    </li>
                    <li>
                      <strong>Booking and Guestlist Requests:</strong> When you
                      make or request a booking (e.g., club guestlist,
                      restaurant reservation), we collect information related to
                      your request, such as preferred dates, times, number of
                      guests, and special requests.
                    </li>
                    <li>
                      <strong>Communications:</strong> We collect the content of
                      messages or communications you send through our App (e.g.,
                      customer support inquiries, invites or messages within the
                      community).
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                    1.2 Information We Collect Automatically
                  </h3>
                  <ul className="space-y-3 ml-4 list-disc text-gray-700">
                    <li>
                      <strong>Device Information:</strong> We may collect
                      information about the device you use to access our
                      Services, such as IP address, operating system, device
                      model, and unique device identifiers.
                    </li>
                    <li>
                      <strong>Usage Data:</strong> We collect information about
                      your interactions with the App, including the pages or
                      features you visit, the time spent on pages, search
                      queries, and other diagnostic data.
                    </li>
                    <li>
                      <strong>Location Information (If You Opt-In):</strong>{" "}
                      With your permission, we may collect approximate or
                      precise geolocation data to provide location-based
                      features (e.g., showing relevant events or dining options
                      nearby).
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                    1.3 Information from Third Parties
                  </h3>
                  <ul className="space-y-3 ml-4 list-disc text-gray-700">
                    <li>
                      <strong>Social Media or Third-Party Services:</strong> If
                      you choose to connect your social media account (e.g.,
                      Facebook, Instagram) or sign in using third-party
                      services, we may receive information (such as your profile
                      name, email, or friend list) from these services, subject
                      to your settings on those platforms.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                2. How We Use Your Information
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                We use the information we collect for purposes such as:
              </p>
              <ul className="space-y-3 ml-8 list-disc text-gray-700">
                <li>
                  <strong>1. Providing and Improving Our Services:</strong> To
                  process your bookings, manage your account, and personalize
                  the content you see in the App.
                </li>
                <li>
                  <strong>2. Communication:</strong> To send you updates,
                  security alerts, and support messages, and to respond to your
                  inquiries.
                </li>
                <li>
                  <strong>3. Marketing and Promotions:</strong> With your
                  consent (where required by law), to send you promotional
                  messages or offers that may interest you.
                </li>
                <li>
                  <strong>4. Analytics and Research:</strong> To analyze usage
                  trends, monitor the effectiveness of our Services, and improve
                  user experience.
                </li>
                <li>
                  <strong>5. Compliance and Protection:</strong> To comply with
                  applicable laws and regulations, respond to lawful requests,
                  and prevent fraud or other unauthorized activities.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                3. How We Share Your Information
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                We do not sell your personal information. We may share your
                information in the following ways:
              </p>
              <ul className="space-y-3 ml-4 list-disc text-gray-700">
                <li>
                  <strong>1. Service Providers:</strong> We may share
                  information with third-party vendors who perform services on
                  our behalf (e.g., hosting, analytics, payment processing).
                  These vendors are obligated to protect your information.
                </li>
                <li>
                  <strong>2. Event Partners:</strong> If you choose to book a
                  restaurant, club, or after-party through our App, we may share
                  necessary details (e.g., name, reservation details) with the
                  venue or event organizer.
                </li>
                <li>
                  <strong>3. Legal Requirements:</strong> We may disclose your
                  information if required to do so by law, or in response to
                  valid requests by governmental authorities (e.g., court
                  orders, subpoenas).
                </li>
                <li>
                  <strong>4. Business Transfers:</strong> In the event of a
                  merger, acquisition, or sale of assets, user information may
                  be transferred or disclosed as part of the transaction.
                </li>
                <li>
                  <strong>5. With Your Consent:</strong> We may share
                  information about you with your consent or at your direction
                  (e.g., when you link your account to a third-party service).
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                4. Cookies and Tracking Technologies
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                We may use cookies, beacons, and similar technologies to:
              </p>
              <ul className="space-y-3 ml-8 list-disc text-gray-700">
                <li>Remember your preferences and settings.</li>
                <li>Understand how you interact with our Services.</li>
                <li>
                  Provide and measure the effectiveness of advertisements or
                  promotional campaigns.
                </li>
              </ul>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                You can usually modify your browser or device settings to limit
                or prevent the use of cookies and other tracking technologies.
                However, disabling these features may affect certain
                functionality of our Services.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                5. Data Security
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                We implement industry-standard security measures designed to
                protect your information. However, no data transmission or
                storage system is 100% secure, and we cannot guarantee the
                absolute security of your data. Please use strong passwords and
                notify us immediately if you suspect any unauthorized access to
                your account.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                6. Data Retention
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                We retain your information for as long as necessary to fulfill
                the purposes outlined in this Privacy Policy, or as required by
                law. This may include keeping certain information after you
                deactivate your account, for instance, when it relates to legal
                obligations, dispute resolution, and enforcing our agreements.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                7. Children's Privacy
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                Our Services are not directed at individuals under 18 years of
                age. If you are under 18, please do not use or provide any
                information through our Services. If we learn that we have
                collected personal information from a user under 18, we will
                take steps to delete that data as soon as possible.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                8. Your Choices and Rights
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                Depending on where you live, you may have certain rights over
                your personal data, including:
              </p>
              <ul className="space-y-3 ml-4 list-disc text-gray-700">
                <li>
                  <strong>1. Access and Update:</strong> You can review and
                  update certain account information directly in the App
                  settings.
                </li>
                <li>
                  <strong>2. Delete or Restrict:</strong> You can request
                  deletion of your account or restrict certain data processing,
                  subject to legal limitations.
                </li>
                <li>
                  <strong>3. Opt-Out of Communications:</strong> You can
                  unsubscribe from promotional emails by following the
                  instructions in those emails or by contacting us directly.
                </li>
              </ul>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                For any such requests, please contact us at the details provided
                below. We may require verification of your identity before
                addressing your request.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                9. International Data Transfers
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                If you access our Services from outside the United Arab Emirates
                (UAE), please note that your information may be transferred to
                and processed in the UAE or other countries where our service
                providers operate. We take steps to ensure appropriate
                safeguards to protect your information during these transfers.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new Privacy
                Policy on our website or within the App, and updating the "Last
                Updated" date above. We encourage you to review this policy
                periodically to stay informed about how we protect your
                information.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                11. Contact Us
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                If you have any questions or concerns about this Privacy Policy
                or our data practices, please contact us at:
              </p>
              <div className="ml-4 space-y-2">
                <p className="text-base md:text-lg text-gray-700">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:help@puravida.events"
                    className="text-black underline hover:text-gray-700 font-medium"
                  >
                    help@puravida.events
                  </a>
                </p>
                <p className="text-base md:text-lg text-gray-700">
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://puravida.events/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline hover:text-gray-700 font-medium"
                  >
                    www.puravida.events
                  </a>
                </p>
              </div>
            </section>
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
