import Call from "../models/callModel.js";
import mongoose from "mongoose";
// import { io } from "../socket.js";


// 📞 Create a new call request
export const createCallRequest = async (req, res) => {
  try {
    const { recipientId, type } = req.body;
    const callerId = req.user.id.toString();
    const { connectedUsers, io } = req.app.locals;

    console.log("📞 New Call Request:", { callerId, recipientId });

    // 1️⃣ Check for existing active calls
    const existingCall = await Call.findOne({
      $or: [
        { callerId, recipientId, status: { $in: ['ringing', 'accepted'] } },
        { callerId: recipientId, recipientId: callerId, status: { $in: ['ringing', 'accepted'] } }
      ]
    });

    if (existingCall) {
      if (existingCall.status === "accepted") {
        console.log("🚫 Active call exists, blocking new request...");
        return res.status(400).json({ 
          message: "An active call is already in progress", 
          existingCallId: existingCall._id 
        });
      } 
      if (existingCall.status === "ringing") {
        const callDuration = (new Date() - new Date(existingCall.startedAt)) / 1000;
        if (callDuration > 30) {
          console.log("⏳ Auto-ending stuck call...");
          await Call.findByIdAndUpdate(existingCall._id, { status: "missed", endedAt: new Date() });
        }
      }
    }

    // 2️⃣ Create and Save the New Call
    const call = new Call({
      callerId,
      recipientId,
      type,
      status: "ringing",
      startedAt: new Date()
    });

    await call.save();
    console.log("✅ Call saved successfully:", call._id);

    // 3️⃣ Get Caller's Socket
    const callerSockets = connectedUsers.get(callerId);
    if (!callerSockets || callerSockets.size === 0) {
      console.log("❌ Caller not connected, marking call as failed...");
      await Call.findByIdAndUpdate(call._id, { status: "failed" });
      return res.status(400).json({ message: "Caller not connected" });
    }

    const callerSocketId = Array.from(callerSockets)[0];

    // 4️⃣ Notify Recipient if Online
    const recipientSockets = connectedUsers.get(recipientId.toString());
    let recipientConnected = false;

    if (recipientSockets && recipientSockets instanceof Set) {
      recipientSockets.forEach(socketId => {
        io.to(socketId).emit("INCOMING_CALL", {
          callId: call._id,
          callerId,
          type,
          status: "ringing",
          callerName: req.user.name,
          callerAvatar: req.user.avatar,
          callerSocketId,
          isIncoming: true
        });
      });
      recipientConnected = true;
    }

    // 5️⃣ Mark Call as Missed if Recipient is Offline
    if (!recipientConnected) {
      console.log("📵 Recipient is offline, marking call as missed...");
      await Call.findByIdAndUpdate(call._id, { status: "missed", endedAt: new Date() });
      return res.status(200).json({
        message: "Recipient offline",
        call: await Call.findById(call._id)
      });
    }

    // 6️⃣ Send Successful Response to Caller
    console.log("✅ Call request created successfully!");
    res.status(201).json({
      message: "Call request created",
      call: {
        ...call.toObject(),
        callerSocketId,
        peerId: callerSocketId
      }
    });

  } catch (error) {
    console.error("❌ Error creating call:", error);

    if (call?._id) {
      await Call.findByIdAndUpdate(call._id, { status: "failed", endedAt: new Date() });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// ✅ Accept a call request (Updates call in DB)
// export const acceptCall = async (req, res) => {
//   try {
//     const { callId } = req.params;
//     const updatedCall = await Call.findByIdAndUpdate(
//       callId,
//       { status: "accepted", startedAt: new Date() },
//       { new: true }
//     );

//     if (!updatedCall) return res.status(404).json({ message: "Call not found" });

//     res.status(200).json({ message: "Call accepted", call: updatedCall });
//   } catch (error) {
//     console.error("Error accepting call:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ❌ Reject a call request (Updates call in DB)
// export const rejectCall = async (req, res) => {
//   try {
//     const { callId } = req.params;
//     const updatedCall = await Call.findByIdAndUpdate(
//       callId,
//       { status: "rejected", endedAt: new Date() },
//       { new: true }
//     );

//     if (!updatedCall) return res.status(404).json({ message: "Call not found" });

//     // ✅ Notify the caller that the call was rejected
//     // io.to(updatedCall.callerId.toString()).emit("CALL_REJECTED", { callId });

//     res.status(200).json({ message: "Call rejected", call: updatedCall });
//   } catch (error) {
//     console.error("Error rejecting call:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // 🚫 End a call (Updates call in DB)


// export const endCall = async (req, res) => {
//   try {
//     const { callId } = req.params;
//     const call = await Call.findById(callId);

//     if (!call) return res.status(404).json({ message: "Call not found" });

//     // ✅ If call was never accepted, mark it as "missed"
//     const callStatus = call.status === "pending" ? "missed" : "ended";

//     const updatedCall = await Call.findByIdAndUpdate(
//       callId,
//       { status: callStatus, endedAt: new Date() },
//       { new: true }
//     );

//     // ✅ Notify both users that the call has ended
//     // io.to(call.callerId.toString()).emit("CALL_ENDED", { callId });
//     // io.to(call.recipientId.toString()).emit("CALL_ENDED", { callId });

//     res.status(200).json({ message: "Call ended", call: updatedCall });
//   } catch (error) {
//     console.error("Error ending call:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// 📜 Get Call History from Call Model
export const getCallHistory = async (req, res) => {
  // console.log("call-hist hit")
  try {
    const userId = req.user.id;

    const callHistory = await Call.find({
      $or: [{ callerId: userId }, { recipientId: userId }],
    })
    .populate("callerId recipientId", "name avatar email")
    .sort({ createdAt: -1 });

    // console.log("call-hist", callHistory)

    res.status(200).json(callHistory);
  } catch (error) {
    console.error("Error fetching call history:", error);
    res.status(500).json({ message: "Server error" });
  }
};
