import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.chatSocket = null;
    this.communitySocket = null;
    this.API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  }

  connect(token) {
    if (!token) {
      console.error("WebSocket connection failed: Missing token");
      return;
    }

    this.chatSocket = io(`${this.API_URL}/chat`, {
      auth: { token },
      transports: ["websocket"],
    });

    this.communitySocket = io(`${this.API_URL}/community`, {
      auth: { token },
      transports: ["websocket"],
    });
  }

  disconnect() {
    [this.chatSocket, this.communitySocket].forEach(socket => {
      socket?.disconnect();
      socket = null;
    });
  }

  // Chat-specific methods
  chat = {
    emit: (event, data) => this.chatSocket?.emit(event, data),
    on: (event, callback) => this.chatSocket?.on(event, callback),
    off: (event) => this.chatSocket?.off(event),
  };

  // Community-specific methods
  community = {
    emit: (event, data) => this.communitySocket?.emit(event, data),
    on: (event, callback) => this.communitySocket?.on(event, callback),
    off: (event) => this.communitySocket?.off(event),
  };
}

export default new SocketService();