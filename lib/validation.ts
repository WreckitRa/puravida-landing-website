/**
 * Validation utilities for form fields
 */

/**
 * Validate Instagram handle
 * Instagram username can only contain letters, numbers, underscores, and periods
 * Must be between 1 and 30 characters
 */
export function validateInstagramHandle(handle: string): {
  isValid: boolean;
  error?: string;
} {
  const instagramRegex = /^[a-zA-Z0-9_.]{1,30}$/;

  if (!handle || handle.trim().length === 0) {
    return {
      isValid: false,
      error: "Your Instagram username is required.",
    };
  }

  // Remove @ if present for validation
  const cleanedHandle = handle.replace(/^@+/, "");

  if (!instagramRegex.test(cleanedHandle)) {
    return {
      isValid: false,
      error:
        "Instagram username can only contain letters, numbers, underscores, and periods, and must be between 1 and 30 characters.",
    };
  }

  return { isValid: true };
}

/**
 * Country-specific phone number regex patterns
 * These patterns validate the local number part (without country code)
 */
export const COUNTRY_PHONE_REGEX: Record<string, RegExp> = {
  "+1": /^[2-9]\d{9}$/, // USA: 10 digits, cannot start with 0 or 1
  "+44": /^7\d{9}$/, // UK: Mobile numbers start with 7
  "+91": /^[6-9]\d{9}$/, // India: Mobile numbers start with 6-9
  "+971": /^(50|52|54|55|56|58)\d{7}$/, // UAE: Mobile starts with 50, 52, etc.
  "+61": /^4\d{8}$/, // Australia: Mobile starts with 4
  "+33": /^(6|7)\d{8}$/, // France: Mobile starts with 6 or 7
  "+49": /^1[5-7]\d{8}$/, // Germany: Mobile starts with 15, 16, or 17
  "+55": /^[9]\d{8}$/, // Brazil: Mobile starts with 9
  "+81": /^([789])\d{9}$/, // Japan: Mobile starts with 7, 8, or 9
  "+234": /^([789])\d{9}$/, // Nigeria: Mobile starts with 7, 8, or 9
  "+92": /^[3]\d{9}$/, // Pakistan: Mobile starts with 3
};

/**
 * Validate phone number using country-specific regex
 * Note: This is a basic validation. For production, consider using libphonenumber-js
 * @param phoneNumber - The local phone number (without country code)
 * @param countryCode - The country code with + prefix (e.g., "+971")
 * @returns Validation result
 */
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string
): {
  isValid: boolean;
  error?: string;
} {
  const trimmedNumber = phoneNumber.trim();

  if (!trimmedNumber) {
    return {
      isValid: false,
      error: "Please enter a valid phone number.",
    };
  }

  // Get regex for the selected country
  const countryRegex = COUNTRY_PHONE_REGEX[countryCode];

  if (countryRegex) {
    if (!countryRegex.test(trimmedNumber)) {
      return {
        isValid: false,
        error: `Invalid format for ${countryCode}. Check the correct number format.`,
      };
    }
  }

  // Basic length check for numbers without specific regex
  if (trimmedNumber.length < 7 || trimmedNumber.length > 15) {
    return {
      isValid: false,
      error: "Please enter a valid phone number.",
    };
  }

  return { isValid: true };
}

/**
 * Get invity_number from localStorage
 */
export function getInvityNumber(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const invityNumberStr = localStorage.getItem("invity_number");
    if (invityNumberStr) {
      const data = JSON.parse(invityNumberStr);
      return data?.invity_number || null;
    }
  } catch (error) {
    console.error("Error reading invity_number from localStorage:", error);
  }

  return null;
}
