"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ReasonKey = "not_sure" | "not_relevant" | "temporary" | "other" | "none";

const REASONS: { key: ReasonKey; label: string }[] = [
  { key: "not_sure", label: "Not sure what this is about" },
  { key: "not_relevant", label: "The app is not relevant to me" },
  { key: "temporary", label: "I will check this out later" },
  { key: "other", label: "Other" },
];

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const phoneFromUrl = useMemo(
    () => searchParams.get("phone") ?? "",
    [searchParams],
  );

  const [selectedReason, setSelectedReason] = useState<ReasonKey>("none");
  const [otherReason, setOtherReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const hasPhone = phoneFromUrl.trim().length > 0;
  const isOtherSelected = selectedReason === "other";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasPhone || isSubmitting) return;

    setIsSubmitting(true);
    setStatus("idle");
    setMessage(null);

    let reason: string | undefined;
    if (selectedReason !== "none") {
      if (isOtherSelected) {
        reason = otherReason.trim() || undefined;
      } else {
        const found = REASONS.find((r) => r.key === selectedReason);
        reason = found?.label;
      }
    }

    try {
      const res = await fetch("/api/public/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneFromUrl,
          ...(reason ? { reason } : {}),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { message?: string };

      if (res.ok) {
        setStatus("success");
        setMessage(
          data.message ||
            "You have been unsubscribed from PuraVida messages.",
        );
      } else if (res.status === 409) {
        setStatus("success");
        setMessage(
          data.message ||
            "This number is already unsubscribed. You won’t receive further messages.",
        );
      } else {
        setStatus("error");
        setMessage(
          data.message ||
            "Something went wrong while processing your request. Please try again later.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-10 w-72 h-72 bg-white/5 rounded-full filter blur-3xl opacity-40 animate-pulse-slow" />
        <div
          className="absolute bottom-0 right-10 w-72 h-72 bg-white/5 rounded-full filter blur-3xl opacity-40 animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header showInviteBanner={false} className="pb-2" />

        <main className="flex-1 flex items-center justify-center px-4 pb-12 pt-4">
          <div className="w-full max-w-xl">
            <div className="bg-white/5 border border-white/10 rounded-3xl px-6 py-8 sm:px-8 sm:py-10 backdrop-blur-md shadow-xl animate-fade-in">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Unsubscribe from{" "}
                <span
                  className="bg-gradient-to-r from-[#E91180] to-[#EB1E44] bg-clip-text text-transparent"
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  PuraVida
                </span>
              </h1>
              <p className="text-white/70 text-sm sm:text-base mb-6">
                We’re sorry to see you go. Tell us why you&apos;d like to
                unsubscribe (optional), and we&apos;ll make sure you don&apos;t
                receive further SMS updates.
              </p>

              {!hasPhone && (
                <div className="mb-6 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                  This unsubscribe link is missing your phone number. Please use
                  the link directly from one of our messages, or contact our
                  support if you need help unsubscribing.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-white/60 tracking-wide mb-1">
                    Phone number
                  </label>
                  <div className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/90">
                    {hasPhone ? phoneFromUrl : "Not provided"}
                  </div>
                </div>

                <div>
                  <p className="block text-xs font-semibold text-white/60 tracking-wide mb-2">
                    Why are you leaving?{" "}
                    <span className="text-white/40 font-normal">(optional)</span>
                  </p>
                  <div className="space-y-2">
                    {REASONS.map((reason) => (
                      <button
                        key={reason.key}
                        type="button"
                        onClick={() => setSelectedReason(reason.key)}
                        className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all duration-200 ${
                          selectedReason === reason.key
                            ? "border-[#E91180] bg-[#E91180]/20 text-white shadow-[0_0_0_1px_rgba(233,17,128,0.4)]"
                            : "border-white/15 bg-black/40 text-white/80 hover:border-white/30 hover:bg-white/5"
                        }`}
                      >
                        <span>{reason.label}</span>
                        <span
                          className={`h-4 w-4 rounded-full border ${
                            selectedReason === reason.key
                              ? "border-[#E91180] bg-[#E91180]"
                              : "border-white/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {isOtherSelected && (
                    <div className="mt-3">
                      <label
                        htmlFor="other-reason"
                        className="block text-xs font-semibold text-white/60 tracking-wide mb-1"
                      >
                        Tell us more (optional)
                      </label>
                      <textarea
                        id="other-reason"
                        rows={3}
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#E91180]/60 focus:border-transparent resize-none"
                        placeholder="Anything we could have done better?"
                      />
                    </div>
                  )}
                </div>

                {message && (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      status === "success"
                        ? "border border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                        : "border border-red-500/50 bg-red-500/10 text-red-100"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!hasPhone || isSubmitting}
                  className="w-full mt-2 inline-flex items-center justify-center rounded-2xl bg-white text-black px-6 py-3.5 text-sm font-bold tracking-wide shadow-lg hover:bg-gray-100 hover:shadow-xl active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Processing..." : "Confirm unsubscribe"}
                </button>

                <p className="text-[11px] text-white/40 leading-relaxed mt-1">
                  Once your number is unsubscribed, you won&apos;t be able to
                  subscribe again using this same link. You can still re-join
                  PuraVida later by going through our regular onboarding.
                </p>
              </form>
            </div>
          </div>
        </main>

        <Footer variant="compact" className="mt-0" />
      </div>
    </div>
  );
}