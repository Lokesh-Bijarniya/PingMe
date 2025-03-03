import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
  }

  // ✅ Connect to the WebSocket Server
  connect() {
    const token = localStorage.getItem("authToken");
  
    if (!token) {
      console.error("❌ WebSocket connection failed: No token found.");
      return;
    }
  
    // console.log("🔑 Token being sent:", token); // ✅ Debugging token
  
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  
    this.socket = io(API_URL, {
      auth: { token },
  withCredentials: true,
  transports: ["websocket", "polling"], // ✅ Allow polling as a fallback
  upgrade: true, // ✅ Allow polling upgrade
  reconnectionDelay: 5000,
  reconnectionAttempts: 5, // ✅ Increase attempts for stability
  timeout: 30000, // ✅ Increase timeout to avoid false failures
});
  
    this.socket.on("connect", () => {
      console.log("✅ WebSocket connected:", this.socket.id);
    });
  
    this.socket.on("connect_error", (err) => {
      console.error("❌ WebSocket connection error:", err.message);
    });
  
    this.socket.on("disconnect", (reason) => {
      console.warn("⚠️ WebSocket disconnected:", reason);
    });
  
    console.log("🔌 WebSocket initialized...");
  }
  
  
  

  // ✅ Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("🔌 WebSocket disconnected.");
    }
  }

  // ✅ Listen for an event
  on(event, callback) {
    this.socket?.on(event, callback);
  }

  // ✅ Stop listening for an event
  off(event) {
    this.socket?.off(event);
  }

  // ✅ Emit an event with optional response handling
  emit(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject("⚠️ WebSocket not connected.");

      console.log(`📡 Emitting event: ${event}`, data);
      this.socket.emit(event, data, (response) => {
        response?.error ? reject(response.error) : resolve(response);
      });
    });
  }
}

// ✅ Export a singleton instance
export default new SocketService();
