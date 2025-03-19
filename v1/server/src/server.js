import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import http from "http";
import passport from "passport";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import communityRoutes from './routes/communityRoutes.js';
import initializeSocket from "./socket/socketServer.js";

// ✅ Load Google Auth BEFORE initializing passport
import "./config/googleAuth.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.io
const { io, connectedUsers } = initializeSocket(server);
app.locals.io = io;
app.locals.connectedUsers = connectedUsers;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://ping-me-ruddy.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://ping-me-ruddy.vercel.app"],
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
  })
);

// ✅ Initialize Session & Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", sameSite: "lax" },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Connect to MongoDB
connectDB();

// ✅ Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests, please try again later.",
});
if (process.env.NODE_ENV === "production") {
  app.use("/v1/api/", apiLimiter);
}

// ✅ Routes
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/chats", chatRoutes);
app.use("/v1/api/messages", messageRoutes);
app.use("/v1/api/calls", callRoutes);
app.use("/v1/api/dashboard", dashboardRoutes);
app.use("/v1/api/communities",communityRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
