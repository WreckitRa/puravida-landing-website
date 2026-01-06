# Google Sheets Setup Guide

This guide explains how to set up Google Sheets integration for the House Party RSVP feature.

## Prerequisites

1. A Google account
2. A Google Cloud Project (or create one at [console.cloud.google.com](https://console.cloud.google.com))
3. A Google Sheet where RSVPs will be stored

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it (e.g., "House Party RSVPs")
4. Copy the **Spreadsheet ID** from the URL:
   - The URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part

## Step 2: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google Sheets API"
5. Click on it and press **Enable**

## Step 3: Create a Service Account

1. In Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Give it a name (e.g., "house-party-rsvp")
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

## Step 4: Create Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Choose **JSON** format
5. Download the JSON file (keep it secure!)

## Step 5: Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click the **Share** button
3. Get the **Service Account Email** from the JSON file you downloaded (it's the `client_email` field)
4. Paste the service account email in the share dialog
5. Give it **Editor** permissions
6. Click **Send**

## Step 6: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

### Option 1: Using Service Account Email and Private Key (Recommended)

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEET_NAME=RSVPs
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Note:** The `GOOGLE_PRIVATE_KEY` should be the entire private key from the JSON file, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. Make sure to include the `\n` characters or use actual newlines.

### Option 2: Using Service Account JSON (Alternative)

If you prefer to use the entire JSON file:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEET_NAME=RSVPs
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

**Note:** Make sure to escape the JSON properly and keep it on a single line, or use a multi-line string format supported by your environment.

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/house-party/YourName`
3. Fill out the RSVP form
4. Check your Google Sheet - you should see the new entry!

## Troubleshooting

### Error: "Google Sheets credentials not configured"
- Make sure all required environment variables are set
- Check that the variable names match exactly (case-sensitive)

### Error: "The caller does not have permission"
- Make sure you've shared the Google Sheet with the service account email
- Verify the service account has Editor permissions

### Error: "Unable to parse range"
- Check that `GOOGLE_SHEET_NAME` matches the exact name of your sheet tab
- Default is "RSVPs" - make sure your sheet has a tab with this name, or update the environment variable

### Data not appearing in the sheet
- Check the browser console and server logs for errors
- Verify the service account has write permissions
- Make sure the Google Sheets API is enabled in your Google Cloud project

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit** your service account JSON file or private key to version control
2. Add `.env.local` to `.gitignore` (already done)
3. For production, use your hosting platform's environment variable settings (Vercel, etc.)
4. Rotate your service account keys periodically
5. Use the principle of least privilege - only grant the minimum permissions needed

## Sheet Structure

The sheet will automatically create headers on the first row:
- Inviter Name
- First Name
- Last Name
- Phone
- Country Code
- Email
- Timestamp

Each RSVP will be added as a new row below the headers.

