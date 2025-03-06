import Call from "../models/callModel.js";
import { v4 as uuidv4 } from "uuid";

export const setupCallEvents = (io, connectedUsers) => {
  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    console.log(`📞 User connected for calls: ${userId}`);




    // 📌 1️⃣ Handle Call Signaling
    socket.on("CALL_SIGNAL", ({ to, signal, callId }) => {
      console.log(`📞 Forwarding signal from ${userId} to ${to}`, { signal });

      const receiverSockets = connectedUsers.get(to);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) =>
          io.to(socketId).emit("RECEIVE_SIGNAL", { signal, callId })
        );
      } else {
        console.warn(`⚠️ Receiver ${to} not found or offline`);
      }
    });

    // 📌 1️⃣ Initiate Call
    socket.on("call:start", async ({ receiverId, type, peerId }, callback) => {
      try {
        if (!connectedUsers.has(receiverId)) {
          return callback({ success: false, message: "Receiver is online but no active sockets found" });
        }
        const receiverSockets = connectedUsers.get(receiverId);
    
        if (!receiverSockets || !Array.isArray(receiverSockets) || receiverSockets.length === 0) {
          return callback({ success: false, message: "Receiver is online but no active sockets found" });
        }
    
        const roomId = uuidv4();
        const call = await Call.create({
          callerId: socket.user.id,
          receiverId,
          type,
          status: "ringing",
          roomId,
          peerId,  // 🔥 Store the peerId
        });
    
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("call:incoming", {
            callId: call._id,
            caller: socket.user,
            roomId,
            type,
            peerId, // 🔥 Send peerId to the receiver
            name: socket.user.name || "Unknown Caller",
          });
        });
    
        return callback({ success: true, call });
      } catch (error) {
        console.error("❌ Call Initiation Error:", error);
        callback({ success: false, message: "Call failed" });
      }
    });
    
    
    
    
    

    // 📌 2️⃣ Accept Call
    socket.on("call:accept", async ({ callId, roomId }, callback) => {
      try {
        const call = await Call.findByIdAndUpdate(
          callId,
          { status: "accepted", callStart: new Date() },
          { new: true }
        );
    
        if (call) {
          const callerSockets = connectedUsers.get(call.callerId.toString());
          if (callerSockets) {
            [...callerSockets].forEach(socketId =>
              io.to(socketId).emit("call:accepted", { callId, roomId, signal: call.signal })
            );
          }
          callback({ success: true, call });
        } else {
          callback({ success: false, message: "Call not found" });
        }
      } catch (error) {
        console.error("❌ Error accepting call:", error);
        callback({ success: false, message: "Failed to accept call" });
      }
    });
    

    // 📌 3️⃣ Reject Call
    socket.on("call:reject", async ({ callId }, callback) => {
      try {
        const call = await Call.findByIdAndUpdate(
          callId,
          { status: "rejected", callEnd: new Date() },
          { new: true }
        );

        if (call) {
          const callerSockets = connectedUsers.get(call.callerId.toString());
          if (callerSockets) {
            [...callerSockets].forEach(socketId =>
              io.to(socketId).emit("call:rejected", { callId })
            );
          }
          callback({ success: true, call });
        } else {
          callback({ success: false, message: "Call not found" });
        }
      } catch (error) {
        console.error("❌ Error rejecting call:", error);
        callback({ success: false, message: "Failed to reject call" });
      }
    });

    // 📌 4️⃣ End Call
    socket.on("call:end", async ({ callId }, callback) => {
      try {
        const call = await Call.findByIdAndUpdate(
          callId,
          { status: "ended", callEnd: new Date() },
          { new: true }
        );

        if (call) {
          const receiverSockets = connectedUsers.get(call.receiverId.toString());
          const callerSockets = connectedUsers.get(call.callerId.toString());

          if (receiverSockets) {
            [...receiverSockets].forEach(socketId =>
              io.to(socketId).emit("call:ended", { callId })
            );
          }

          if (callerSockets) {
            [...callerSockets].forEach(socketId =>
              io.to(socketId).emit("call:ended", { callId })
            );
          }

          callback({ success: true, call });
        } else {
          callback({ success: false, message: "Call not found" });
        }
      } catch (error) {
        console.error("❌ Error ending call:", error);
        callback({ success: false, message: "Failed to end call" });
      }
    });


    

    // 📌 5️⃣ Handle Disconnection
    socket.on("disconnect", () => {
      const userId = socket.user?.id?.toString();
      if (!userId || !connectedUsers.has(userId)) return;

      const sockets = connectedUsers.get(userId);
      sockets.delete(socket.id);

      if (sockets.size === 0) {
        connectedUsers.delete(userId);
      }
    });
  });
};
