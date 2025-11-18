// API utility functions

/**
 * Get API base URL and ensure it uses HTTPS to prevent mixed-content errors
 */
function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || "https://api.puravida.events";
  
  // Force HTTPS if HTTP is detected (prevents mixed-content errors)
  if (url.startsWith("http://")) {
    console.warn(
      "API URL uses HTTP, converting to HTTPS to prevent mixed-content errors"
    );
    return url.replace("http://", "https://");
  }
  
  return url;
}

const API_BASE_URL = getApiBaseUrl();

export interface OnboardingSubmissionData {
  // Personal Information
  fullName: string;
  gender: string;
  age: string;
  nationality: string;
  mobile: string; // Combined phone code + mobile in international format (e.g., "+971501234567")
  email?: string; // Optional in form, but API spec shows it as required - backend should handle
  instagram: string;

  // Music & Lifestyle
  musicTaste: string[];
  musicTasteOther?: string;
  favoriteDJ: string;
  favoritePlacesDubai: string[];
  favoritePlacesOther?: string;
  festivalsBeenTo: string;
  festivalsWantToGo: string;
  nightlifeFrequency: string;
  idealNightOut: string;

  // Attribution
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    gclid?: string;
    fbclid?: string;
    ttclid?: string;
    li_fat_id?: string;
    msclkid?: string;
    ref?: string;
    first_touch_timestamp?: string;
    last_touch_timestamp?: string;
    landing_page?: string;
    referrer?: string;
  };

  // Metadata
  submitted_at: string;
  time_to_complete_seconds: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

/**
 * Submit onboarding application to the backend
 */
export async function submitOnboarding(
  data: OnboardingSubmissionData
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || {
          code: "UNKNOWN_ERROR",
          message: result.message || "An error occurred",
        },
      };
    }

    return {
      success: true,
      message: result.message || "Application submitted successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Network error. Please try again.",
      },
    };
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export interface Country {
  id: number;
  name: string;
  short_code: string;
  country_code: number | string; // API returns number, but we may convert to string
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  gender: string;
  status: number;
  country_id: number;
  instagram_handle: string;
  image?: string;
}

export interface CreateUserResponse {
  success: boolean;
  message?: string;
  data?: {
    id?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

/**
 * Get list of countries with codes
 */
export async function getCountries(): Promise<Country[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/get-country-code`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }

    const result = await response.json();
    // API returns data wrapped in { data: [...] }
    const countries: Country[] = result.data || [];
    return countries;
  } catch (error) {
    console.error("Error fetching countries:", error);
    // Return empty array or fallback countries
    return [];
  }
}

/**
 * Create user after step 1 completion
 */
export async function createUser(
  data: CreateUserData
): Promise<CreateUserResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    const result: CreateUserResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || {
          code: "UNKNOWN_ERROR",
          message: result.message || "Failed to create user",
        },
      };
    }

    return {
      success: true,
      message: result.message || "User created successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("API Error creating user:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Network error. Please try again.",
      },
    };
  }
}
