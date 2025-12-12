/**
 * Shared utility functions used across the application
 */

/**
 * Format price based on currency
 */
export function formatPrice(amount: number, currency: string = "usd"): string {
  const currencySymbols: Record<string, string> = {
    usd: "$",
    aed: "AED ",
    eur: "€",
    gbp: "£",
  };
  const symbol =
    currencySymbols[currency.toLowerCase()] || currency.toUpperCase() + " ";
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format event date to readable string
 */
export function formatEventDate(dateTime: string): string {
  const date = new Date(dateTime);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${days[date.getDay()]}, ${
    months[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Format event time range
 */
export function formatEventTime(dateTime: string, endDate?: string): string {
  const start = new Date(dateTime);
  const startTime = start.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (endDate) {
    const end = new Date(endDate);
    const endTime = end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${startTime} - ${endTime}`;
  }
  return startTime;
}

/**
 * Smooth scroll to element with offset
 */
export function scrollToElement(elementId: string, offset: number = 100): void {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
}

/**
 * Check if URL is a video file
 */
export function isVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext));
}
