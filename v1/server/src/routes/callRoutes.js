import express from "express";
import  verifyToken  from "../middleware/authMiddleware.js";
import {
  createCallRequest,
  // acceptCall,
  // rejectCall,
  // endCall,
  getCallHistory
} from "../controllers/callController.js";

const router = express.Router();

// Create a new call request
router.post("/call-request", verifyToken, createCallRequest);

// Accept a call request
// router.put("/accept-call/:callId", verifyToken, acceptCall);

// // Reject a call request
// router.put("/reject-call/:callId", verifyToken, rejectCall);

// // End a call
// router.put("/end-call/:callId", verifyToken, endCall);

router.get("/call-history", verifyToken, getCallHistory);

export default router;