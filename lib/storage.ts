/**
 * Utility functions for localStorage with backward compatibility
 */

export interface InviteData {
  invite?: string;
}

export interface ApiData {
  data: {
    first_name: string;
    wait_list_count: number;
    phone: string;
    [key: string]: any;
  };
}

/**
 * Get invite data from localStorage with backward compatibility
 * Checks both 'invite' and '25thApril_invite' keys
 */
export function getInviteData(): InviteData | null {
  if (typeof window === "undefined") return null;

  try {
    // Try new key first
    const inviteStr = localStorage.getItem("invite");
    if (inviteStr) {
      return JSON.parse(inviteStr);
    }

    // Fallback to legacy key
    const legacyInviteStr = localStorage.getItem("25thApril_invite");
    if (legacyInviteStr) {
      return JSON.parse(legacyInviteStr);
    }
  } catch (error) {
    console.error("Error reading invite data from localStorage:", error);
  }

  return null;
}

/**
 * Get API data from localStorage
 */
export function getApiData(): ApiData | null {
  if (typeof window === "undefined") return null;

  try {
    const apiDataStr = localStorage.getItem("apiData");
    if (apiDataStr) {
      return JSON.parse(apiDataStr);
    }
  } catch (error) {
    console.error("Error reading apiData from localStorage:", error);
  }

  return null;
}

/**
 * Get who invited name with fallback
 */
export function getWhoInvited(): string {
  const inviteData = getInviteData();
  if (inviteData?.invite) {
    try {
      return decodeURIComponent(inviteData.invite);
    } catch (error) {
      console.error("Error decoding invite:", error);
      return inviteData.invite;
    }
  }
  return "PuraVida";
}

/**
 * Encode string to base64 (Unicode-safe)
 * Uses the same method as the old implementation for backward compatibility
 * This matches: btoa(unescape(encodeURIComponent(str)))
 */
export function encodeBase64(str: string): string {
  if (typeof window === "undefined") return "";
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error("Error encoding base64:", error);
    return "";
  }
}

/**
 * Decode base64 string (Unicode-safe)
 * Handles characters outside Latin1 range properly
 * This is the reverse of: btoa(unescape(encodeURIComponent(str)))
 *
 * The encoding process: str -> encodeURIComponent -> unescape -> btoa
 * The decoding process: URL decode -> atob -> convert to bytes -> TextDecoder (UTF-8)
 */
export function decodeBase64(str: string | null): string | null {
  if (!str || typeof window === "undefined") return null;

  // Helper function to clean and validate base64 string
  const cleanBase64 = (input: string): string | null => {
    try {
      // Remove whitespace and trim
      let cleaned = input.replace(/\s/g, "").trim();

      // Validate base64 characters (A-Z, a-z, 0-9, +, /, =)
      // Remove any invalid characters that might have been introduced
      cleaned = cleaned.replace(/[^A-Za-z0-9+/=]/g, "");

      // Base64 strings must be multiples of 4, add padding if needed
      while (cleaned.length % 4) {
        cleaned += "=";
      }

      // Validate that we have a valid base64 string
      if (cleaned.length === 0) {
        return null;
      }

      return cleaned;
    } catch (e) {
      return null;
    }
  };

  // Try multiple approaches
  const attempts = [
    // Attempt 1: URL decode first, then clean and decode
    () => {
      try {
        const urlDecoded = decodeURIComponent(str);
        const cleaned = cleanBase64(urlDecoded);
        if (!cleaned) return null;
        return atob(cleaned);
      } catch (e) {
        return null;
      }
    },
    // Attempt 2: Clean directly without URL decoding
    () => {
      try {
        const cleaned = cleanBase64(str);
        if (!cleaned) return null;
        return atob(cleaned);
      } catch (e) {
        return null;
      }
    },
    // Attempt 3: Try with manual URL component handling
    () => {
      try {
        // Handle URL-encoded characters manually
        let decoded = str
          .replace(/%3D/g, "=")
          .replace(/%2B/g, "+")
          .replace(/%2F/g, "/");
        const cleaned = cleanBase64(decoded);
        if (!cleaned) return null;
        return atob(cleaned);
      } catch (e) {
        return null;
      }
    },
  ];

  // Try each approach until one works
  for (const attempt of attempts) {
    try {
      const binaryString = attempt();
      if (binaryString) {
        // Convert binary string to Uint8Array (bytes)
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Decode UTF-8 bytes to string using TextDecoder
        return new TextDecoder("utf-8").decode(bytes);
      }
    } catch (error) {
      // Continue to next attempt
      continue;
    }
  }

  // All attempts failed
  console.error(
    "Error decoding base64: All attempts failed for string:",
    str.substring(0, 50)
  );
  return null;
}

/**
 * Decode invite parameter from URL and store in localStorage
 * Handles format: invite=base64Name|base64Phone
 * Also handles URLs where extra text might be appended
 */
export function decodeAndStoreInviteFromUrl(encodedInvite: string | null): {
  invite: string | null;
  invity_number: string | null;
} {
  if (!encodedInvite || typeof window === "undefined") {
    return { invite: null, invity_number: null };
  }

  try {
    // Extract just the base64 part if there's extra text
    // Look for the pattern: base64|base64 (two base64 strings separated by |)
    let inviteParam = encodedInvite.trim();

    // Helper to extract base64 string from a string that might have extra text
    const extractBase64 = (str: string): string | null => {
      if (!str) return null;

      // Base64 strings only contain A-Z, a-z, 0-9, +, /, = and are typically padded with =
      // Try to find a valid base64 string in the input
      const base64Match = str.match(/[A-Za-z0-9+/]+=*/);
      if (base64Match) {
        let base64 = base64Match[0];
        // Ensure proper padding
        while (base64.length % 4) {
          base64 += "=";
        }
        return base64;
      }
      return null;
    };

    // Look for the | separator first
    const pipeIndex = inviteParam.indexOf("|");

    if (pipeIndex === -1) {
      // No pipe found, might be just one base64 string or malformed
      console.warn(
        "No pipe separator found in invite parameter:",
        inviteParam.substring(0, 50)
      );
      return { invite: null, invity_number: null };
    }

    // Split by | and extract base64 from each part
    const parts = inviteParam.split("|");
    const encodedName = extractBase64(parts[0] || "");
    const encodedNumber = extractBase64(parts[1] || "");

    if (!encodedName || !encodedNumber) {
      console.warn(
        "Could not extract valid base64 from invite parameter. Name:",
        !!encodedName,
        "Number:",
        !!encodedNumber
      );
      return { invite: null, invity_number: null };
    }

    // Decode each value from Base64
    const invite = decodeBase64(encodedName);
    const invity_number = decodeBase64(encodedNumber);

    // Store in localStorage if decoded successfully
    if (invite !== null) {
      localStorage.setItem(
        "invite",
        JSON.stringify({ invite: encodeURIComponent(invite) })
      );
    }

    if (invity_number !== null) {
      localStorage.setItem(
        "invity_number",
        JSON.stringify({ invity_number: invity_number })
      );
    }

    return { invite, invity_number };
  } catch (error) {
    console.error("Error decoding invite from URL:", error);
    return { invite: null, invity_number: null };
  }
}
