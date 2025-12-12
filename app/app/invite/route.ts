import { permanentRedirect } from "next/navigation";

/**
 * Route handler for /app/invite
 *
 * Permanently redirects (301) to /ihaveinvite
 * This ensures the redirect works server-side with SSR,
 * regardless of Apache reverse proxy configuration.
 *
 * Handles all HTTP methods (GET, POST, etc.) - all redirect to /ihaveinvite
 *
 * Note: Redirects are already lightweight, no optimization needed
 */
export async function GET() {
  permanentRedirect("/ihaveinvite");
}

export async function POST() {
  permanentRedirect("/ihaveinvite");
}

export async function PUT() {
  permanentRedirect("/ihaveinvite");
}

export async function DELETE() {
  permanentRedirect("/ihaveinvite");
}

export async function PATCH() {
  permanentRedirect("/ihaveinvite");
}
