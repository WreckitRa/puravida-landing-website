import type { Metadata } from "next";
import { congratulationMetadata } from "./metadata";

export const metadata: Metadata = congratulationMetadata;

export default function CongratulationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
