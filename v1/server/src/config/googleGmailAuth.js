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

// export const testGmailAuth = async () => {
//   try {
//     const { tokens } = await oauth2Client.refreshToken(process.env.GOOGLE_REFRESH_TOKEN);
//     oauth2Client.setCredentials(tokens);

//     const { data } = await gmail.users.getProfile({ userId: 'me' });
//     // console.log("✅ Gmail API authenticated successfully:", data.emailAddress);
//   } catch (error) {
//     console.error("❌ Gmail API authentication failed:", error.message);
//     console.error("Error details:", error.response?.data);
//   }
// };

// const testRefreshToken = async () => {
//   try {
//     const { tokens } = await oauth2Client.refreshToken(process.env.GOOGLE_REFRESH_TOKEN);
//     // console.log("✅ Refresh token is valid:", tokens);
//   } catch (error) {
//     console.error("❌ Refresh token is invalid:", error.message);
//   }
// };
// testRefreshToken();

// // Call this function at server startup
// testGmailAuth();