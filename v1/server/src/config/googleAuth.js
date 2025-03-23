import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user already exists with this email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // Create a new user if not found
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id, // Save Google ID
            avatar: profile.photos[0].value,
            isVerified: true, // Mark as verified
          });
        } else if (!user.googleId) {
          // If user exists but doesn't have Google ID, link the account
          user.googleId = profile.id;
          user.isVerified = true; // Ensure verified status
        }

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


