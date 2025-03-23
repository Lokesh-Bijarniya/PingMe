import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { setupChatEvents } from "./chatEvents.js";
import { setupCommunityEvents } from "./communityEvents.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    connectionStateRecovery: {
      maxDisconnectionDuration: 30000,
    },
  });

  const connectedUsers = new Map();

  // ✅ Authentication Middleware for ALL Namespaces
  io.of("/chat").use(authMiddleware);
  io.of("/community").use(authMiddleware);
  io.use(authMiddleware); // Apply globally for default namespace too

  async function authMiddleware(socket, next) {
    try {
      const token = socket.handshake.auth?.token;
      console.log(`🔐 Auth attempt for ${socket.nsp.name}:`, token ? "✅ Present" : "❌ Missing");

      if (!token) {
        console.error("🚫 No token - disconnecting socket:", socket.id);
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).lean();
      if (!user) {
        console.error("🚫 User not found for ID:", decoded.id);
        return next(new Error("User not found"));
      }

      socket.user = { id: user._id.toString(), name: user.name, avatar: user.avatar };
      console.log("✅ Auth success:", socket.user.id);
      next();
    } catch (error) {
      console.error("🔴 Auth failure:", error.message);
      next(new Error("Authentication failed"));
    }
  }

  // ✅ Track Connected Users
  io.use((socket, next) => {
    const userId = socket.user?.id;
    if (!userId) return next(new Error("Invalid user ID"));

    if (!connectedUsers.has(userId)) connectedUsers.set(userId, new Set());
    connectedUsers.get(userId).add(socket.id);

    console.log("➕ Stored Socket ID:", { userId, socketId: socket.id });
    next();
  });

  // ✅ Now Setup Events (AFTER Auth)
  setupChatEvents(io, connectedUsers);
  setupCommunityEvents(io, connectedUsers);

  io.on("connection",async (socket) => {
    console.log("✅ User connected:", socket.user.id);
    await User.findByIdAndUpdate(socket.user?.id, { lastActive: new Date(), isActive: true });
    io.emit("ONLINE_STATUS", { onlineUsers: Array.from(connectedUsers.keys()) });

    socket.on("disconnect",async () => {
      const userId = socket.user?.id;
      if (userId && connectedUsers.has(userId)) {
        const sockets = connectedUsers.get(userId);
        sockets.delete(socket.id);
        if (sockets.size === 0){ 
          connectedUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { lastActive: new Date(), isActive: false });
        }

        io.emit("ONLINE_STATUS", { onlineUsers: Array.from(connectedUsers.keys()) });
      }
    });
  });

  return { io, connectedUsers };
};

export default initializeSocket;
