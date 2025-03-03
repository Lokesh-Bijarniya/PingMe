// initializeSocket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { setupChatEvents } from './chatEvents.js';
import { setupCallEvents } from "./callEvents.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // ✅ Allow both transports
    connectionStateRecovery: {
      maxDisconnectionDuration: 30000, // 30 seconds
    },
  });

  const connectedUsers = new Map();

  // ✅ Strict authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];
  
      console.log("🔐 Auth attempt from:", socket.id, "Token:", token ? "✅ Present" : "❌ Missing");
  
      if (!token) {
        console.error("🚫 No token - disconnecting socket:", socket.id);
        socket.disconnect(true);
        return next(new Error("Authentication required"));
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).lean();
  
      if (!user) {
        console.error("🚫 Invalid user - disconnecting socket:", socket.id);
        socket.disconnect(true);
        return next(new Error("User not found"));
      }
  
      // ✅ Store user in socket
      socket.user = {
        id: decoded.id.toString(),
        name: user.name,
        avatar: user.avatar,
      };
  
      console.log("✅ Auth success for:", socket.user.id);
      next();
    } catch (error) {
      console.error("🔴 Auth failure:", error.message);
      socket.disconnect(true);
      next(new Error("Authentication failed"));
    }
  });
  

  io.use((socket, next) => {
    const userId = socket.user?.id;
    if (!userId) {
      console.error("❌ Unauthorized socket - no userId found:", socket.id);
      return next(new Error("Unauthorized"));
    }
  
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
  
    const sockets = connectedUsers.get(userId);
    if (sockets instanceof Set) {
      sockets.add(socket.id);
    } else {
      console.error("🔥 Resetting corrupted sockets for", userId);
      connectedUsers.set(userId, new Set([socket.id]));
    }
  
    console.log("✅ User Connected:", userId, "Active sockets:", [...sockets]);
    console.log("📌 Full Connected Users Map:", JSON.stringify([...connectedUsers]));
  
    next();
  });
  

  // Configure events AFTER auth
  setupChatEvents(io, connectedUsers);
  setupCallEvents(io, connectedUsers);


  return { io, connectedUsers };
};

export default initializeSocket;


