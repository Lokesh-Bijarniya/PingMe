import { Router } from "express";

import { getDashboardStats} from "../controllers/dashboardController.js";
import {verifyToken} from "../middleware/authMiddleware.js";

const router = Router();

// Get dashboard stats and recent chats
router.get("/stats", verifyToken, getDashboardStats);

export default router;