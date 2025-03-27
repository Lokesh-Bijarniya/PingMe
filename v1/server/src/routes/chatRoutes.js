import express from 'express';
import {
  getOrCreateChat,
  getChats,
  deleteDirectChat,
  getMessages
} from '../controllers/chatController.js';
import {verifyToken} from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new chat session
router.post('/', verifyToken, getOrCreateChat);
// Get all chat sessions with last message
router.get('/', verifyToken, getChats);

router.get("/:chatId", verifyToken, getMessages);

router.delete("/:chatId", verifyToken, deleteDirectChat);

export default router;