import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import http from "http";
import passport from "passport";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
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
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());

// ✅ Initialize Passport
app.use(passport.initialize());

// ✅ Connect to MongoDB
connectDB();


app.use((req, res, next) => {
  console.log(`📌 Incoming request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});


// ✅ Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many requests, please try again later.",
});

if (process.env.NODE_ENV === "production") {
  app.use("/v1/api/", apiLimiter);
}


// ✅ Routes
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/chats", chatRoutes);
app.use("/v1/api/dashboard", dashboardRoutes);
app.use("/v1/api/communities",communityRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong." });
  next();
});

// health check 
app.get("/v1/api/health", (req, res) => {
  res.json({ status: "ok" });
});


// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
