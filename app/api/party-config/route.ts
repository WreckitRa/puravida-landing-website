import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

// Load party config from JSON file
function loadPartyConfig() {
  try {
    const configPath = join(process.cwd(), "lib", "party-config.json");
    const fileContents = readFileSync(configPath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error loading party config:", error);
    return { events: {} };
  }
}

export async function GET() {
  try {
    const config = loadPartyConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error serving party config:", error);
    return NextResponse.json(
      { error: "Failed to load party config" },
      { status: 500 }
    );
  }
}

