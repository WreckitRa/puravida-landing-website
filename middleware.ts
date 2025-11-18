import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// App Store URLs - can be configured via environment variables
const GOOGLE_PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ||
  'https://play.google.com/store/apps/details?id=com.puravida.events';

const APPLE_APP_STORE_DEEP_LINK =
  process.env.NEXT_PUBLIC_APPLE_APP_STORE_DEEP_LINK ||
  'itms-apps://itunes.apple.com/us/app/6744160016?mt=8';

const APPLE_APP_STORE_WEB_URL =
  process.env.NEXT_PUBLIC_APPLE_APP_STORE_URL ||
  'https://apps.apple.com/us/app/id6744160016';

/**
 * Middleware to handle device detection and app store redirection
 *
 * Routes:
 * - /app/* on Android devices → Google Play Store (307 redirect)
 * - /app/* on iOS devices → Apple App Store deep link (307 redirect)
 * - /app/* on other devices → Home page (/) (307 redirect)
 *
 * Note: iOS deep links (itms-apps://) work best in Safari on iOS devices.
 * Other browsers may not support the protocol handler.
 *
 * Note: Next.js may show a deprecation warning about "middleware" vs "proxy".
 * This is the correct implementation for Next.js 16. The "proxy" feature
 * mentioned in the warning may be for a future version.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const lowerUserAgent = userAgent.toLowerCase();

  // Check if path starts with /app/ or is exactly /app
  if (pathname.startsWith('/app/') || pathname === '/app') {
    // Android detection (case-insensitive)
    if (lowerUserAgent.includes('android')) {
      // Build redirect URL with query parameters preserved (if needed)
      const redirectUrl = new URL(GOOGLE_PLAY_STORE_URL);
      // Optionally preserve query parameters - uncomment if needed
      // searchParams.forEach((value, key) => {
      //   redirectUrl.searchParams.set(key, value);
      // });
      return NextResponse.redirect(redirectUrl.toString(), { status: 307 });
    }

    // iOS detection (case-insensitive) - matches iPhone, iPod, or iPad
    if (/iphone|ipod|ipad/i.test(userAgent)) {
      // Use deep link for iOS devices
      // Note: itms-apps:// protocol works in Safari on iOS
      // For other browsers, consider using the web URL or a fallback page
      return NextResponse.redirect(APPLE_APP_STORE_DEEP_LINK, { status: 307 });
    }

    // Default: redirect to home page for web/other devices
    return NextResponse.redirect(new URL('/', request.url), { status: 307 });
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

// Configure middleware to only run on /app and /app/* paths
export const config = {
  matcher: ['/app', '/app/:path*'],
};

