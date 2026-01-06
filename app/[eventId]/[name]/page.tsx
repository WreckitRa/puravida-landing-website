import { Suspense } from "react";
import FriendsFamilyInviteClient from "./FriendsFamilyInviteClient";
import { readFileSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EventInvitePageProps {
  params: Promise<{ eventId: string; name: string }>;
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
  
  // If eventId is provided and exists, use it
  if (eventId && events[eventId]) {
    return events[eventId];
  }
  
  // If eventId was provided but doesn't exist, return null (will trigger 404)
  if (eventId && !events[eventId]) {
    return null;
  }
  
  // Otherwise use default event
  if (events.default) {
    return events.default;
  }
  
  // Fallback to first available event
  const eventKeys = Object.keys(events);
  if (eventKeys.length > 0) {
    return events[eventKeys[0]];
  }
  
  // Last resort: return empty config
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

export default async function EventInvitePage({
  params,
}: EventInvitePageProps) {
  const { eventId, name } = await params;
  const decodedName = decodeURIComponent(name || "");
  
  // Remove timestamp for display, but keep original for sheet
  const nameWithoutTimestamp = removeTimestampFromName(decodedName);
  const inviterName = capitalizeName(nameWithoutTimestamp);
  const originalInviterName = decodedName; // Keep original with timestamp for sheet
  
  // Load config and get the specific event
  const config = loadPartyConfig();
  const partyConfig = getEventConfig(config, eventId);
  
  // If event not found, return 404
  if (!partyConfig) {
    notFound();
  }
  
  const sheetId = extractSheetId(partyConfig.sheetUrl);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <FriendsFamilyInviteClient
        eventId={eventId}
        inviterName={inviterName}
        originalInviterName={originalInviterName}
        partyConfig={partyConfig}
        sheetId={sheetId}
      />
    </Suspense>
  );
}

