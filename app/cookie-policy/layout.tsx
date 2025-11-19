import type { Metadata } from "next";
import { metadata as cookiePolicyMetadata } from "./metadata";

export const metadata: Metadata = cookiePolicyMetadata;

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
