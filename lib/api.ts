// API utility functions

/**
 * Check if mock mode is enabled (for development/testing)
 */
export const isMockMode = () => {
  return process.env.NEXT_PUBLIC_MOCK_API === "true";
};

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
  first_name: string;
  last_name: string;
  gender: string;
  age: number;
  nationality: string;
  phone: string; // Phone number WITHOUT country code (e.g., "501234567")
  country_code: string; // Country code (e.g., "971" for UAE)
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
  // Mock mode for development
  if (isMockMode()) {
    console.log("🔧 MOCK MODE: submitOnboarding", data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Application submitted successfully (MOCK)",
          data: {
            user_id: 12345,
            status: "pending",
          },
        });
      }, 500); // Simulate network delay
    });
  }

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
  country_id: number; // Country ID for phone number country
  nationality_id: number; // Country ID for user's nationality
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
  // Mock mode for development
  if (isMockMode()) {
    console.log("🔧 MOCK MODE: getCountries");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: "United Arab Emirates",
            short_code: "AE",
            country_code: 971,
          },
          { id: 2, name: "Lebanon", short_code: "LB", country_code: 961 },
          { id: 3, name: "United States", short_code: "US", country_code: 1 },
          { id: 4, name: "United Kingdom", short_code: "GB", country_code: 44 },
          { id: 5, name: "Saudi Arabia", short_code: "SA", country_code: 966 },
        ]);
      }, 200);
    });
  }

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

export interface CreateManualUserData {
  first_name: string;
  last_name: string;
  phone: string;
  country_id: number; // Country ID for phone number country
  nationality_id: number; // Country ID for user's nationality
  email?: string;
  instagram_handle: string;
  dob?: string;
  address?: string;
  gender: string; // "1" for Man, "2" for Woman
  invity_number?: string;
  source?: string;
  manual_status?: number; // 1 for pending users created through onboarding
}

export interface CreateManualUserResponse {
  success?: boolean; // Optional since API might not always return it
  message?: string;
  data?: {
    id?: number | string; // Can be number or UUID string
    customer_id?: string | null; // Stripe customer ID (null initially)
    first_name?: string;
    last_name?: string;
    phone?: string;
    wait_list_count?: number;
    status?: string; // "pending" or other statuses
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
 * Create manual user (legacy endpoint for old onboarding flow)
 * This matches the old /api/create-manual-user endpoint
 */
export async function createManualUser(
  data: CreateManualUserData
): Promise<CreateManualUserResponse> {
  // Mock mode for development
  if (isMockMode()) {
    console.log("🔧 MOCK MODE: createManualUser", data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "User created successfully (MOCK)",
          data: {
            id: 12345,
            customer_id: null,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            wait_list_count: 0,
            status: "pending",
          },
        });
      }, 500);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/create-manual-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    const result: CreateManualUserResponse = await response.json();

    if (!response.ok) {
      // Check if error message contains SQL duplicate entry error
      const errorMessage =
        result.error?.message || result.message || "Failed to create user";
      const isDuplicatePhone =
        (errorMessage.includes("Duplicate entry") &&
          errorMessage.includes("users_phone_unique")) ||
        errorMessage.includes("SQLSTATE[23000]") ||
        errorMessage.includes("Integrity constraint violation") ||
        errorMessage.includes("1062");

      return {
        success: false,
        error: result.error || {
          code: isDuplicatePhone ? "DUPLICATE_PHONE" : "UNKNOWN_ERROR",
          message: errorMessage,
        },
      };
    }

    return {
      success: true,
      message: result.message || "User created successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("API Error creating manual user:", error);
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

export interface ProductPricing {
  price_id: string;
  amount: number;
  original_price?: string;
  percentage?: number;
}

export interface ProductPricingByGender {
  male?: ProductPricing;
  female?: ProductPricing;
}

export interface Product {
  product_id: string;
  name: string;
  description?: string;
  images?: string[];
  monthly?: ProductPricingByGender;
  yearly?: ProductPricingByGender;
  currency_type?: string;
  offer_message?: string;
}

export interface GetProductsResponse {
  success: boolean;
  data?: Product[];
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Get products from the API
 * @param stripeType - 1 for production Stripe (default), other values for test mode
 */
export async function getProducts(
  stripeType: number = 1
): Promise<GetProductsResponse> {
  // Mock mode for development
  if (isMockMode()) {
    console.log("🔧 MOCK MODE: getProducts");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              product_id: "prod_mock",
              name: "PuraVida Membership",
              monthly: {
                male: {
                  price_id: "price_mock_monthly",
                  amount: 99,
                  original_price: "149",
                },
              },
              yearly: {
                male: {
                  price_id: "price_mock_yearly",
                  amount: 999,
                  original_price: "1788",
                  percentage: 44,
                },
              },
              currency_type: "usd",
            },
          ],
        });
      }, 300);
    });
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/get-products?stripe_type=${stripeType}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const result: GetProductsResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || {
          code: "UNKNOWN_ERROR",
          message: "Failed to fetch products",
        },
      };
    }

    return {
      success: true,
      data: result.data || [],
    };
  } catch (error) {
    console.error("API Error fetching products:", error);
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

export interface CreateSubscriptionData {
  user_id: number | string; // Can be number or UUID string
  price_id: string;
}

export interface CreateSubscriptionResponse {
  success?: boolean;
  message?: string;
  data?: {
    // Backend returns client_secret directly in data
    client_secret?: string;
    // Also has payment_intent object with client_secret
    payment_intent?: {
      id?: string;
      client_secret?: string;
      status?: string;
      [key: string]: any;
    };
    ephemeral_key?: string;
    stripe_subscription_id?: string;
    stripe_customer_id?: string;
    customer_id?: string;
    requires_payment?: boolean;
    [key: string]: any; // Allow other fields
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Create subscription via backend API (matches mobile app approach)
 * Uses the public endpoint /api/create-subscription-for-user which accepts user_id
 * Returns payment_intent.client_secret, ephemeral_key, stripe_subscription_id, customer_id
 */
export async function createSubscription(
  data: CreateSubscriptionData
): Promise<CreateSubscriptionResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/create-subscription-for-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: data.user_id,
          price_id: data.price_id,
        }),
      }
    );

    const result: CreateSubscriptionResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || {
          code: "UNKNOWN_ERROR",
          message: "Failed to create subscription",
        },
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("API Error creating subscription:", error);
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

export interface PartialOnboardingData {
  // User identifier (phone or user_id from step 1)
  user_id?: number | string;
  phone?: string;
  country_code?: string;

  // Step tracking
  current_step: number;
  step_name: string;

  // Partial form data (only fields completed so far)
  fullName?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  age?: number;
  nationality?: string;
  email?: string;
  instagram?: string;
  musicTaste?: string[];
  musicTasteOther?: string;
  favoriteDJ?: string;
  favoritePlacesDubai?: string[];
  favoritePlacesOther?: string;
  festivalsBeenTo?: string;
  festivalsWantToGo?: string;
  nightlifeFrequency?: string;
  idealNightOut?: string;

  // Attribution (captured once, stored with first save)
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
  updated_at: string;
  time_spent_seconds?: number;
}

export interface PartialOnboardingResponse {
  success?: boolean;
  message?: string;
  data?: {
    user_id?: number | string;
    current_step?: number;
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
 * Save partial onboarding data (incremental save on each step)
 * This allows us to capture data even if user abandons the flow
 */
export async function savePartialOnboarding(
  data: PartialOnboardingData
): Promise<PartialOnboardingResponse> {
  // Mock mode for development
  if (isMockMode()) {
    console.log("🔧 MOCK MODE: savePartialOnboarding", data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Progress saved successfully (MOCK)",
          data: {
            user_id: 12345,
            current_step: data.current_step,
          },
        });
      }, 300);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/onboarding/partial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    const result: PartialOnboardingResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || {
          code: "UNKNOWN_ERROR",
          message: result.message || "Failed to save progress",
        },
      };
    }

    return {
      success: true,
      message: result.message || "Progress saved successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("API Error saving partial onboarding:", error);
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

// Event & Guestlist API

export interface EventDetails {
  id: string;
  event_name: string;
  main_artist_name: string;
  other_artist_name?: string;
  venue: {
    id: string;
    name: string;
    image?: string;
  };
  date_time: string;
  end_date?: string;
  guest_close_date_time?: string;
  file?: string;
  address: string;
  guest_status: number;
  description?: string;
  priority_entry_rules?: string;
  guest_max_capacity?: number;
  current_guestlist_count: number;
  is_guestlist_open: boolean;
  is_guestlist_full: boolean;
  table_max_capacity?: number;
  booking_status: number;
  age_policy?: string;
  type: number;
  dress_codes?: Array<{
    id: number;
    name: string;
  }>;
  images?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  club_profile?: {
    id: string;
    logo?: string;
    club: {
      id: string;
      name: string;
    };
  };
  restaurant_profile?: any;
  total_wishlist_count?: number;
}

export interface GetEventDetailsResponse {
  success?: boolean;
  data?: EventDetails;
  message?: string;
}

export interface RegisterToGuestlistData {
  country_code: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  plus_one_count?: number;
  referral_link?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
}

export interface GuestlistRegistrationResult {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  plus_one_count?: number;
  already_registered: boolean;
  registered_at: string;
}

export interface RegisterToGuestlistResponse {
  success?: boolean;
  data?: GuestlistRegistrationResult;
  message?: string;
}

/**
 * Get event details by event ID
 */
export async function getEventDetails(
  eventId: string
): Promise<GetEventDetailsResponse> {
  // Mock mode for development
  if (isMockMode()) {
    console.log("🔧 MOCK MODE: getEventDetails", eventId);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: eventId,
            event_name: "Summer Vibes 2024",
            main_artist_name: "DJ Khaled",
            other_artist_name: "Special Guests",
            venue: {
              id: "venue-1",
              name: "White Beach, Atlantis The Palm",
            },
            date_time: "2024-07-15 20:00:00",
            end_date: "2024-07-16 02:00:00",
            file: "https://api.puravida.events/storage/event_images/JjAAlE9wi4V3fRyUQmbp10HC8AOSJKHMjT7GP862.mp4",
            address: "Dubai, UAE",
            guest_status: 1,
            description: "Join us for an unforgettable night under the stars!",
            guest_max_capacity: 500,
            current_guestlist_count: 342,
            is_guestlist_open: true,
            is_guestlist_full: false,
            booking_status: 1,
            type: 1,
          },
          message: "Event details retrieved successfully.",
        });
      }, 300);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/public/events/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const result: GetEventDetailsResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to fetch event details",
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error("API Error fetching event details:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
    };
  }
}

/**
 * Register to event guestlist
 */
export async function registerToGuestlist(
  eventId: string,
  data: RegisterToGuestlistData
): Promise<RegisterToGuestlistResponse> {
  // Mock mode for development
  if (isMockMode()) {
    console.log("🔧 MOCK MODE: registerToGuestlist", eventId, data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: "guestlist-entry-uuid",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone: data.phone,
            plus_one_count: data.plus_one_count || 0,
            already_registered: false,
            registered_at: new Date().toISOString(),
          },
          message: "Successfully added to guestlist.",
        });
      }, 1000);
    });
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/public/events/${eventId}/guestlist/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result: RegisterToGuestlistResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to register to guestlist",
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error("API Error registering to guestlist:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
    };
  }
}
