import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

// Add required scopes
const SCOPES = ['https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.send'];
oauth2Client.scopes = SCOPES;

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
