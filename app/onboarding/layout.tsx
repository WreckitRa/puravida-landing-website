import type { Metadata } from "next";
import { onboardingMetadata } from "./metadata";

export const dynamic = "force-static";

export const metadata: Metadata = onboardingMetadata;

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
