import type { Metadata } from "next";
import { iHaveInviteMetadata } from "./metadata";

export const metadata: Metadata = iHaveInviteMetadata;

export default function IHaveInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
