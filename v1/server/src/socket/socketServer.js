import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { setupChatEvents } from "./chatEvents.js";
import { setupCallEvents } from "./callEvents.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // Allow both transports
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

  // ✅ Manage connected users
  io.use((socket, next) => {
    const userId = socket.user?.id.toString();
    if (!userId) return next(new Error("Invalid user ID"));
  
    // ✅ Ensure `connectedUsers` stores an array of socket IDs
    if (!connectedUsers[userId]) {
      connectedUsers[userId] = [];
    }
  
    // ✅ Avoid duplicate socket IDs
    if (!connectedUsers[userId].includes(socket.id)) {
      connectedUsers[userId].push(socket.id);
    }
  
    console.log("➕ Stored Socket ID:", {
      userId,
      socketId: socket.id,
      storedAs: connectedUsers[userId], // Log stored sockets
    });
  
    next();
  });
  
  
  

  // Configure events AFTER auth
  setupChatEvents(io, connectedUsers);
  setupCallEvents(io, connectedUsers);

  // 📌 Handle global disconnection
  io.on("disconnect", (socket) => {
    const userId = socket.user?.id;

    if (userId && connectedUsers.has(userId)) {
      const sockets = connectedUsers.get(userId);
      sockets.delete(socket.id);

      if (sockets.size === 0) {
        connectedUsers.delete(userId);
      }

      console.log(`🚫 User disconnected: ${userId}`);
      console.log("📌 Updated Connected Users Map:", JSON.stringify([...connectedUsers]));
    }
  });

  return { io, connectedUsers };
};

export default initializeSocket;