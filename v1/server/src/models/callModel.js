import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: String, required: true, unique: true }, // Unique room ID for call session
    type: { type: String, enum: ["audio", "video"], required: true }, // Audio or Video call
    callStart: { type: Date }, // Timestamp when call starts
    callEnd: { type: Date }, // Timestamp when call ends
    status: {
      type: String,
      enum: ["ringing", "pending", "accepted", "rejected", "ongoing", "missed", "ended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Call = mongoose.model("Call", callSchema);
export default Call;
