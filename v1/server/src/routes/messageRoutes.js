import express from "express";
import { 
  sendMessage, 
  getMessages,
  updateMessageStatus
} from "../controllers/messageController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Send message to specific chat
router.post("/:chatId", verifyToken, sendMessage);
// Get message history for a chat
router.get("/:chatId", verifyToken, getMessages);
// ✅ Update message status (read/delivered)
router.put("/status/:messageId", verifyToken, updateMessageStatus);

// router.put("/read/:chatId", verifyToken, markMessagesAsRead);

export default router;