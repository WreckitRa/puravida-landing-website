import { Suspense } from "react";
import FriendsFamilyInviteClient from "./FriendsFamilyInviteClient";
import { readFileSync } from "fs";
import { join } from "path";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

interface FriendsFamilyInvitePageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ event?: string }>;
}

// Extract sheet ID from Google Sheets URL
function extractSheetId(sheetUrl: string): string | null {
  try {
    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Remove timestamp from name (e.g., "raphael-1767705854933" -> "raphael")
function removeTimestampFromName(name: string): string {
  // Remove timestamp pattern: - followed by digits at the end
  return name.replace(/-\d+$/, "");
}

// Capitalize name (first letter of each word)
function capitalizeName(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Load party config from JSON file
function loadPartyConfig() {
  try {
    const configPath = join(process.cwd(), "lib", "party-config.json");
    const fileContents = readFileSync(configPath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error loading party config:", error);
    // Return default structure
    return {
      events: {
        default: {
          partyName: "Exclusive House Party",
          partyBanner: {
            type: "image",
            url: "/assets/party-banner.jpg",
          },
          guestlistCloseTime: new Date().toISOString(),
          partyStartTime: new Date().toISOString(),
          sheetUrl: "",
        },
      },
    };
  }
}

// Get event config by event ID
function getEventConfig(config: any, eventId: string | null) {
  const events = config?.events || {};
  
  console.log("getEventConfig called with eventId:", eventId);
  console.log("Available event keys:", Object.keys(events));
  
  // If eventId is provided and exists, use it
  if (eventId && events[eventId]) {
    console.log("Found event:", eventId);
    return events[eventId];
  }
  
  // If eventId was provided but doesn't exist, log warning
  if (eventId && !events[eventId]) {
    console.warn(`Event "${eventId}" not found in config. Available events:`, Object.keys(events));
  }
  
  // Otherwise use default event
  if (events.default) {
    console.log("Using default event");
    return events.default;
  }
  
  // Fallback to first available event
  const eventKeys = Object.keys(events);
  if (eventKeys.length > 0) {
    console.log("Falling back to first available event:", eventKeys[0]);
    return events[eventKeys[0]];
  }
  
  // Last resort: return empty config
  console.warn("No events found in config, using fallback");
  return {
    partyName: "Exclusive House Party",
    partyBanner: {
      type: "image",
      url: "/assets/party-banner.jpg",
    },
    guestlistCloseTime: new Date().toISOString(),
    partyStartTime: new Date().toISOString(),
    sheetUrl: "",
  };
}

export default async function FriendsFamilyInvitePage({
  params,
  searchParams,
}: FriendsFamilyInvitePageProps) {
  const { name } = await params;
  
  // Try to get event from searchParams first
  let event: string | null = null;
  try {
    const resolvedSearchParams = await searchParams;
    event = resolvedSearchParams?.event || null;
  } catch (error) {
    console.warn("Error reading searchParams:", error);
  }
  
  // Fallback: Read from headers if searchParams doesn't work
  if (!event) {
    try {
      const headersList = await headers();
      const referer = headersList.get("referer") || "";
      const url = new URL(referer || "http://localhost");
      event = url.searchParams.get("event");
    } catch (error) {
      console.warn("Error reading from headers:", error);
    }
  }
  
  // Debug: Log the entire searchParams object
  console.log("Full searchParams object:", await searchParams);
  console.log("Event from searchParams:", event);
  const decodedName = decodeURIComponent(name || "");
  
  // Remove timestamp for display, but keep original for sheet
  const nameWithoutTimestamp = removeTimestampFromName(decodedName);
  const inviterName = capitalizeName(nameWithoutTimestamp);
  const originalInviterName = decodedName; // Keep original with timestamp for sheet
  
  // Load config and get the specific event
  const config = loadPartyConfig();
  
  // Debug logging BEFORE getEventConfig
  console.log("=== DEBUG INFO ===");
  console.log("Event parameter from URL:", event);
  console.log("Event parameter type:", typeof event);
  console.log("Event parameter value (stringified):", JSON.stringify(event));
  console.log("Available events in config:", Object.keys(config?.events || {}));
  
  const partyConfig = getEventConfig(config, event);
  const sheetId = extractSheetId(partyConfig.sheetUrl);
  
  // Debug logging AFTER getEventConfig
  console.log("Selected party config:", partyConfig.partyName);
  console.log("Banner URL:", partyConfig.partyBanner?.url);
  console.log("==================");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <FriendsFamilyInviteClient
        inviterName={inviterName}
        originalInviterName={originalInviterName}
        partyConfig={partyConfig}
        sheetId={sheetId}
      />
    </Suspense>
  );
}

