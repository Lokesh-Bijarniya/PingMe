import { io } from "socket.io-client";


class SocketService {
  constructor() {
    this.socket = null;
  }

  // Connect to the WebSocket Server
  connect() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("❌ WebSocket connection failed: No token found.");
      return;
    }

    // const API_URL = "http://localhost:8000";
    const API_URL = "https://pingme-wkue.onrender.com";
    this.socket = io(API_URL, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionDelay: 5000,
      reconnectionAttempts: 5,
      timeout: 30000,
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

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("🔌 WebSocket disconnected.");
    }
  }

  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event) {
    this.socket?.off(event);
  }

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

export default new SocketService();