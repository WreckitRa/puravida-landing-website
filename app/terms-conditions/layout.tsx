import type { Metadata } from "next";
import { termsMetadata } from "./metadata";

export const dynamic = "force-static";

export const metadata: Metadata = termsMetadata;

export default function TermsConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
