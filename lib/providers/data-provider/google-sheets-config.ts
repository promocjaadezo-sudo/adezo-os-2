export interface GoogleSheetsConfig {
  spreadsheetId: string;
  baseUrl: string;
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  return {
    spreadsheetId: (process.env.ADEZO_GOOGLE_SHEETS_SPREADSHEET_ID || "").trim(),
    baseUrl: (process.env.ADEZO_GOOGLE_SHEETS_BASE_URL || "https://docs.google.com/spreadsheets/d").trim(),
  };
}

export function isGoogleSheetsConfigured(config = getGoogleSheetsConfig()): boolean {
  return config.spreadsheetId.length > 0;
}
