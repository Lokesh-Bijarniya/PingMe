import Call from "../models/callModel.js";

// 📌 Get Call History for a User
export const getCallHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const calls = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 }) // Sort by latest calls first
      .populate("callerId", "name email") // Fetch caller details
      .populate("receiverId", "name email"); // Fetch receiver details

    res.status(200).json({ success: true, calls });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
