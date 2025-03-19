import { Router } from "express";

import { getDashboardStats, getRecentChats } from "../controllers/dashboardController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = Router();

// Get dashboard stats and recent chats
router.get("/stats", verifyToken, getDashboardStats);
router.get("/recent-chats", verifyToken, getRecentChats);

export default router;