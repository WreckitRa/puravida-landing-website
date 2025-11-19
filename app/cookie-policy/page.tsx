"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CookiePolicyPage() {
  useEffect(() => {
    // Track page view
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", "G-7XGLG30T94", {
        page_path: "/cookie-policy",
      });
    }
  }, []);

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
              Cookie Policy
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-medium">
              Learn about how we use cookies and similar technologies
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
                PuraVida Cookie Policy
              </h1>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                This Cookie Policy explains how PuraVida ("<strong>we</strong>,"
                "<strong>us</strong>," or "<strong>our</strong>") uses cookies
                and similar technologies when you visit our website (
                <a
                  href="https://www.puravida.events/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline hover:text-gray-700 font-medium"
                >
                  www.puravida.events
                </a>
                ) or use our mobile application ("<strong>App</strong>")
                (collectively, the "<strong>Services</strong>").
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                By using our Services, you consent to the use of cookies in
                accordance with this Cookie Policy. If you do not agree to our
                use of cookies, you should set your browser or device settings
                accordingly or discontinue use of our Services.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                1. What Are Cookies?
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                Cookies are small text files that are placed on your computer or
                mobile device when you visit a website or use an app. They are
                widely used to make websites and apps work more efficiently, as
                well as to provide information to the owners of the site or app.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                Cookies allow a website or app to recognize your device and
                store some information about your preferences or past actions.
                This helps us provide you with a better experience when you
                return to our Services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                2. Types of Cookies We Use
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                We use the following types of cookies:
              </p>

              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                    2.1 Essential Cookies
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    These cookies are necessary for the Services to function and
                    cannot be switched off in our systems. They are usually only
                    set in response to actions made by you, such as setting your
                    privacy preferences, logging in, or filling in forms.
                  </p>
                  <ul className="space-y-2 ml-4 list-disc text-gray-700">
                    <li>
                      <strong>Authentication cookies:</strong> Used to identify
                      you when you log in to our Services
                    </li>
                    <li>
                      <strong>Security cookies:</strong> Used to support
                      security features and prevent fraudulent use
                    </li>
                    <li>
                      <strong>Session cookies:</strong> Used to maintain your
                      session while you navigate through our Services
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                    2.2 Analytics and Performance Cookies
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    These cookies allow us to count visits and traffic sources
                    so we can measure and improve the performance of our
                    Services. They help us understand how visitors interact with
                    our Services by collecting and reporting information
                    anonymously.
                  </p>
                  <ul className="space-y-2 ml-4 list-disc text-gray-700">
                    <li>
                      <strong>Google Analytics:</strong> We use Google Analytics
                      to understand how users interact with our Services. This
                      helps us improve user experience and optimize our content.
                    </li>
                    <li>
                      <strong>Performance monitoring:</strong> These cookies
                      help us identify performance issues and improve the speed
                      and reliability of our Services
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                    2.3 Functionality Cookies
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    These cookies enable the Services to provide enhanced
                    functionality and personalization. They may be set by us or
                    by third-party providers whose services we have added to our
                    pages.
                  </p>
                  <ul className="space-y-2 ml-4 list-disc text-gray-700">
                    <li>
                      <strong>Preference cookies:</strong> Remember your
                      language, region, or other preferences
                    </li>
                    <li>
                      <strong>Feature cookies:</strong> Enable specific features
                      like remembering your login status or form data
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                    2.4 Targeting and Advertising Cookies
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    These cookies may be set through our Services by our
                    advertising partners. They may be used to build a profile of
                    your interests and show you relevant content on other sites.
                    They do not store directly personal information but are
                    based on uniquely identifying your browser and internet
                    device.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                3. Third-Party Cookies
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                In addition to our own cookies, we may also use various
                third-party cookies to report usage statistics of the Services,
                deliver advertisements, and so on. These third parties may set
                their own cookies or similar technologies on your device.
              </p>
              <div className="space-y-2 ml-4">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  <strong>Google Analytics:</strong> We use Google Analytics to
                  analyze how users use our Services. Google Analytics uses
                  cookies and other tracking technologies to collect information
                  about your use of the Services. For more information about how
                  Google uses data, please visit{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline hover:text-gray-700 font-medium"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                4. How Long Do Cookies Stay on My Device?
              </h2>
              <div className="space-y-2 ml-4">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  <strong>Session Cookies:</strong> These are temporary cookies
                  that expire when you close your browser or app. They are
                  deleted when you end your browsing session.
                </p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  <strong>Persistent Cookies:</strong> These cookies remain on
                  your device for a set period or until you delete them. They
                  are activated each time you visit the website or app that
                  created that particular cookie. Persistent cookies are used to
                  remember your preferences and actions across our Services.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                5. Managing Your Cookie Preferences
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                You have the right to decide whether to accept or reject
                cookies. You can exercise your cookie rights by setting your
                preferences in your browser or device settings.
              </p>

              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                    5.1 Browser Settings
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    Most web browsers allow you to control cookies through their
                    settings preferences. However, limiting cookies may impact
                    your experience using our Services. Here are links to
                    instructions for managing cookies in popular browsers:
                  </p>
                  <ul className="space-y-2 ml-4 list-disc text-gray-700">
                    <li>
                      <a
                        href="https://support.google.com/chrome/answer/95647"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:text-gray-700 font-medium"
                      >
                        Google Chrome
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:text-gray-700 font-medium"
                      >
                        Mozilla Firefox
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:text-gray-700 font-medium"
                      >
                        Safari
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:text-gray-700 font-medium"
                      >
                        Microsoft Edge
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                    5.2 Mobile Device Settings
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    For mobile devices, you can manage cookies through your
                    device settings. Please refer to your device
                    manufacturer&apos;s instructions for more information.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                    5.3 Opt-Out Tools
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2">
                    You can opt out of certain third-party cookies by visiting:
                  </p>
                  <ul className="space-y-2 ml-4 list-disc text-gray-700">
                    <li>
                      <a
                        href="https://tools.google.com/dlpage/gaoptout"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:text-gray-700 font-medium"
                      >
                        Google Analytics Opt-out
                      </a>
                    </li>
                    <li>
                      <a
                        href="http://www.youronlinechoices.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:text-gray-700 font-medium"
                      >
                        Your Online Choices
                      </a>{" "}
                      (for EU users)
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                6. Local Storage and Similar Technologies
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                In addition to cookies, we may use other similar technologies
                such as:
              </p>
              <ul className="space-y-2 ml-8 list-disc text-gray-700">
                <li>
                  <strong>Local Storage:</strong> We use browser local storage
                  to store information such as your preferences, invite data,
                  and user session data to enhance your experience.
                </li>
                <li>
                  <strong>Session Storage:</strong> Temporary storage that is
                  cleared when you close your browser or app.
                </li>
                <li>
                  <strong>Web Beacons:</strong> Small graphic images that may be
                  included in our Services to help us understand how you
                  interact with our content.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                7. Updates to This Cookie Policy
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                We may update this Cookie Policy from time to time to reflect
                changes in our practices or for other operational, legal, or
                regulatory reasons. We will notify you of any material changes
                by posting the new Cookie Policy on this page and updating the
                &quot;Last Updated&quot; date.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                We encourage you to review this Cookie Policy periodically to
                stay informed about how we use cookies.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-8">
                8. Contact Us
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed ml-4">
                If you have any questions about our use of cookies or this
                Cookie Policy, please contact us at:
              </p>
              <div className="ml-4 space-y-2">
                <p className="text-base md:text-lg text-gray-700">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:hello@thisispuravida.com"
                    className="text-black underline hover:text-gray-700 font-medium"
                  >
                    hello@thisispuravida.com
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

            {/* Last Updated */}
            <div className="space-y-4 pt-4 border-t border-gray-200 mt-8">
              <p className="text-sm text-gray-500">
                <strong>Last Updated:</strong>{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
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
