import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

interface RSVPData {
  inviterName: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  email?: string;
  eventName?: string;
  timestamp: string;
}

// Get Google Sheets configuration from environment variables (fallback)
const DEFAULT_SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "RSVPs";

// Initialize Google Sheets client
async function getSheetsClient() {
  try {
    // Option 1: Service Account (recommended for production)
    // Expects GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in env
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (serviceAccountEmail && privateKey) {
      const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      return sheets;
    }

    // Option 2: Service Account JSON (alternative)
    // Expects GOOGLE_SERVICE_ACCOUNT_JSON as a JSON string
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      const credentials = JSON.parse(serviceAccountJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      return sheets;
    }

    throw new Error(
      "Google Sheets credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY, or GOOGLE_SERVICE_ACCOUNT_JSON"
    );
  } catch (error) {
    console.error("Error initializing Google Sheets client:", error);
    throw error;
  }
}

// Read existing data from Google Sheet
async function readSheetData(spreadsheetId: string): Promise<RSVPData[]> {
  if (!spreadsheetId) {
    throw new Error("Spreadsheet ID is required");
  }

  try {
    const sheets = await getSheetsClient();

    // First, check if headers exist, if not create them
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A1:H1`,
    });

    const headers = headerResponse.data.values?.[0];
    const hasHeaders =
      headers &&
      headers.length > 0 &&
      headers[0]?.toLowerCase().includes("inviter");

    // Read all data (skip header row if it exists)
    const range = hasHeaders
      ? `${SHEET_NAME}!A2:H`
      : `${SHEET_NAME}!A:H`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    // Convert rows to RSVPData objects
    return rows
      .filter((row) => row && row.length > 0 && row[0]) // Filter empty rows
      .map((row) => ({
        inviterName: row[0] || "",
        firstName: row[1] || "",
        lastName: row[2] || "",
        phone: String(row[3] || "").replace(/\D/g, ""), // Normalize phone
        countryCode: row[4] || "",
        email: row[5] || "",
        eventName: row[6] || "",
        timestamp: row[7] || new Date().toISOString(),
      }));
  } catch (error) {
    console.error("Error reading from Google Sheet:", error);
    // If sheet doesn't exist or is empty, return empty array
    return [];
  }
}

// Write data to Google Sheet
async function appendToSheet(data: RSVPData, spreadsheetId: string) {
  if (!spreadsheetId) {
    throw new Error("Spreadsheet ID is required");
  }

  try {
    const sheets = await getSheetsClient();

    // Check if headers exist
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A1:H1`,
    });

    const headers = headerResponse.data.values?.[0];
    const hasHeaders =
      headers &&
      headers.length > 0 &&
      headers[0]?.toLowerCase().includes("inviter");

    // Create headers if they don't exist
    if (!hasHeaders) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A1:H1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "Inviter Name",
              "First Name",
              "Last Name",
              "Phone",
              "Country Code",
              "Email",
              "Event Name",
              "Timestamp",
            ],
          ],
        },
      });
    }

    // Append new row
    const row = [
      data.inviterName,
      data.firstName,
      data.lastName,
      data.phone,
      data.countryCode,
      data.email || "",
      data.eventName || "",
      data.timestamp,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    console.error("Error writing to Google Sheet:", error);
    throw error;
  }
}

// Check for duplicate based on phone number
function isDuplicate(existingData: RSVPData[], phone: string, countryCode: string): boolean {
  const normalizedPhone = phone.replace(/\D/g, ""); // Remove non-digits
  return existingData.some((entry) => {
    const existingPhone = entry.phone.replace(/\D/g, "");
    return existingPhone === normalizedPhone && entry.countryCode === countryCode;
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      inviterName,
      firstName,
      lastName,
      phone,
      countryCode,
      email,
      eventName,
      sheetId,
    } = body;

    // Validation
    if (!inviterName || !firstName || !lastName || !phone || !countryCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Use provided sheetId or fallback to environment variable
    const spreadsheetId = sheetId || DEFAULT_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json(
        {
          success: false,
          message: "Sheet configuration error. Please contact support.",
        },
        { status: 500 }
      );
    }

    // Read existing data from Google Sheet
    const existingData = await readSheetData(spreadsheetId);

    // Check for duplicates
    if (isDuplicate(existingData, phone, countryCode)) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already RSVP'd for this event",
          duplicate: true,
        },
        { status: 409 }
      );
    }

    // Create new entry
    const newEntry: RSVPData = {
      inviterName,
      firstName,
      lastName,
      phone: phone.replace(/\D/g, ""), // Normalize phone number
      countryCode,
      email: email || "",
      eventName: eventName || "",
      timestamp: new Date().toISOString(),
    };

    // Append to Google Sheet
    await appendToSheet(newEntry, spreadsheetId);

    return NextResponse.json({
      success: true,
      message: "RSVP submitted successfully",
      data: newEntry,
    });
  } catch (error) {
    console.error("Error processing RSVP:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process RSVP. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetId = searchParams.get("sheetId") || DEFAULT_SPREADSHEET_ID;

    if (!sheetId) {
      return NextResponse.json(
        {
          success: false,
          message: "Sheet ID is required",
        },
        { status: 400 }
      );
    }

    const data = await readSheetData(sheetId);
    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error reading RSVPs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to read RSVPs",
      },
      { status: 500 }
    );
  }
}

