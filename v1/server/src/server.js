import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import helmet from "helmet";
import cors from "cors";
import jwt from "jsonwebtoken";
import http from "http";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import initializeSocket from "./socket/socketServer.js"; // ✅ Import new Socket.io server

import "./config/googleAuthController.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const { io, connectedUsers } = initializeSocket(server);

// Attach both to app locals
app.locals.io = io;
app.locals.connectedUsers = connectedUsers;

// Update middleware to use app.locals
app.use((req, res, next) => {
  req.io = app.locals.io;
  next();
});


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://ping-me-ruddy.vercel.app", "wss://pingme-wkue.onrender.com"],
        frameSrc: ["'self'", "https://accounts.google.com"], 
      },
    },
  })
);




const allowedOrigins = [
  "http://localhost:5173",
  "https://ping-me-ruddy.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);



app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB();

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per window
  message: "Too many requests, please try again later.",
});
if (process.env.NODE_ENV === "production") {
  app.use("/v1/api/", apiLimiter);
}


// app.use((req, res, next) => {
//   console.log("📩 Incoming Request:");
//   console.log("Headers:", req.headers);
//   console.log("Body:", req.body);
//   next();
// });


// Routes
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/chats", chatRoutes);
app.use("/v1/api/messages", messageRoutes);
app.use("/v1/api/calls", callRoutes); 

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    websocket: io.engine.clientsCount,
  });
});



// Initiate Google OAuth
app.get(
  "/v1/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle Google OAuth callback
app.get(
  "/v1/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.cookie("token", token, { httpOnly: true });
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  }
);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
