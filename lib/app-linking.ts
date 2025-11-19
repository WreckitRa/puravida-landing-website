/**
 * App deep linking utilities
 * Handles mobile app deep linking with fallback to app stores
 */

const IOS_FALLBACK_URL = "itms-apps://itunes.apple.com/us/app/6744160016?mt=8";
const ANDROID_FALLBACK_URL =
  "https://play.google.com/store/apps/details?id=com.puravida.events";

/**
 * Detect if device is Android
 */
export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android/i.test(userAgent);
}

/**
 * Detect if device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  return /iphone|ipad|ipod/i.test(userAgent);
}

/**
 * Detect if device is mobile (Android or iOS)
 */
export function isMobile(): boolean {
  return isAndroid() || isIOS();
}

/**
 * Check if current path should trigger app deep linking
 * Checks both virtual path (/app/) and query params (code)
 */
export function shouldTriggerAppLinking(
  pathname: string,
  searchParams: URLSearchParams
): boolean {
  const containsApp =
    pathname.toLowerCase().includes("/app/") || searchParams.has("code");
  return containsApp && isMobile();
}

/**
 * Redirect to app store fallback
 * Redirects to iOS App Store or Google Play Store based on device
 */
export function redirectToAppStore(): void {
  if (typeof window === "undefined") return;

  setTimeout(() => {
    if (isAndroid()) {
      window.location.href = ANDROID_FALLBACK_URL;
    } else if (isIOS()) {
      window.location.href = IOS_FALLBACK_URL;
    }
  }, 300);
}

/**
 * Initialize app deep linking
 * Should be called on page load to handle app deep links
 */
export function initAppLinking(): void {
  if (typeof window === "undefined") return;

  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  if (shouldTriggerAppLinking(pathname, searchParams)) {
    redirectToAppStore();
  }
}
