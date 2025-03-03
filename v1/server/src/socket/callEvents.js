import Call from "../models/callModel.js";

export const setupCallEvents = (io, connectedUsers) => {
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Get user ID from socket
    const userId = socket.user?.id?.toString();
    if (!userId) return;

    // 🛠 Ensure `connectedUsers` stores socket IDs as a `Set`
    if (!connectedUsers.has(userId) || !(connectedUsers.get(userId) instanceof Set)) {
      connectedUsers.set(userId, new Set()); // Fix: Always store a Set
    }

    connectedUsers.get(userId).add(socket.id);

    console.log(`📌 Full Connected Users Map:`, JSON.stringify([...connectedUsers.entries()]));

    // 📞 Call Acceptance Handler
    socket.on("ACCEPT_CALL", async ({ callId, callerSocketId }) => {
      try {
        console.log(`✅ Accepting call ${callId} - Caller: ${callerSocketId}, Recipient: ${socket.id}`);

        const call = await Call.findByIdAndUpdate(
          callId,
          {
            status: "accepted",
            startedAt: new Date(),
            $addToSet: { participants: userId },
          },
          { new: true }
        );

        if (!call) {
          return socket.emit("CALL_ERROR", { message: "Call not found" });
        }

        const recipientPeerId = socket.id;
        const callerPeerId = callerSocketId;

        io.to(callerSocketId).emit("CALL_ACCEPTED", {
          callId,
          peerId: recipientPeerId,
          type: call.type,
        });

        console.log("Call accepted")

        if (connectedUsers.has(userId)) {
          connectedUsers.get(userId).forEach((socketId) => {
            io.to(socketId).emit("CALL_ACCEPTED", {
              callId,
              peerId: callerPeerId,
              type: call.type,
            });
          });
        }
      } catch (error) {
        console.error("❌ Accept call error:", error);
        socket.emit("CALL_ERROR", "Failed to accept call");
      }
    });

    // ❌ Call Rejection Handler
    socket.on("REJECT_CALL", async ({ callId, callerSocketId }) => {
      try {
        await Call.findByIdAndUpdate(callId, {
          status: "rejected",
          endedAt: new Date(),
        });

        io.to(callerSocketId).emit("CALL_REJECTED", { callId });

        console.log("Call rejected")

        if (connectedUsers.has(userId)) {
          connectedUsers.get(userId).forEach((socketId) => {
            io.to(socketId).emit("CALL_REJECTED", { callId });
          });
        }
      } catch (error) {
        console.error("Reject call error:", error);
        socket.emit("CALL_ERROR", "Failed to reject call");
      }
    });

    // 🚫 Call Termination Handler
    socket.on("END_CALL", async ({ callId }) => {
      try {
        console.log(`📞 Ending call: ${callId}`);

        const call = await Call.findByIdAndUpdate(
          callId,
          {
            status: "ended",
            endedAt: new Date(),
          },
          { new: true }
        );

        if (!call) return;

        const participants = [call.callerId.toString(), call.recipientId.toString()];

        participants.forEach((participantId) => {
          if (connectedUsers.has(participantId)) {
            connectedUsers.get(participantId).forEach((socketId) => {
              io.to(socketId).emit("CALL_ENDED", { callId });
            });
          }
        });

        console.log(`✅ Call ${callId} marked as ended`);
      } catch (error) {
        console.error("❌ End call error:", error);
        socket.emit("CALL_ERROR", "Failed to end call");
      }
    });

    // 📡 WebRTC Signaling Handler
   // In setupCallEvents.js
socket.on("CALL_SIGNAL", ({ to, signal }) => {
  const recipientId = to.toString();
  console.log(`📤 Sending CALL_SIGNAL to ${recipientId} with signal:`, signal);

  if (connectedUsers.has(recipientId)) {
    connectedUsers.get(recipientId).forEach((socketId) => {
      if (socketId !== socket.id) {
        io.to(socketId).emit("RECEIVE_SIGNAL", {
          from: socket.id,
          signal,
          timestamp: Date.now(),
        });
        console.log(`📨 Signal sent to socket ${socketId}`);
      }
    });
  } else {
    console.warn(`⚠️ No connected sockets for recipient ${recipientId}`);
  }
});

socket.on("RECEIVE_SIGNAL", ({ from, signal }) => {
  console.log(`📩 Received RECEIVE_SIGNAL from ${from} with signal:`, signal);
  // Ensure this is handled by the peer (already done in CallWindow)
});

    // ❌ Disconnection Handler
    socket.on("disconnect", () => {
      if (connectedUsers.has(userId)) {
        const sockets = connectedUsers.get(userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          connectedUsers.delete(userId);
        }
      }
      console.log(`❌ User disconnected: ${userId}`);
    });
  });
};
