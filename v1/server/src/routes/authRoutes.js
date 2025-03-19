import express from "express";
import passport from "passport";
import { upload } from "../config/multer.js";
import {
  changePassword,
  deleteAccount,
  getMe,
  loginUser,
  logout,
  passwordResetRequest,
  refreshToken,
  registerUser,
  resendVerificationEmail,
  resetPassword,
  searchUsers,
  updateProfile,
  verifyEmail,
} from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Manual Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyToken, getMe);
router.post("/refresh-token", refreshToken);
router.post("/password-reset-request", passwordResetRequest);
router.post("/reset-password", resetPassword);

router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Google Auth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleLogin
);

// Protect these routes with verifyToken middleware
router.put(
  "/update-profile",
  verifyToken,
  upload.single("avatar"),
  updateProfile
);
router.post("/change-password", verifyToken, changePassword);
router.delete("/delete-account", verifyToken, deleteAccount);
router.post("/logout", verifyToken, logout);
// router.post("/add-friend", verifyToken, addFriend);
// router.get("/friends/:userId", verifyToken, getFriends);
// router.delete("/remove-friend", authMiddleware, removeFriend);
// router.get("/friend-requests", authMiddleware, getFriendRequests);
// router.post("/accept-request", authMiddleware, acceptRequest);
// router.delete("/reject-request", authMiddleware, rejectRequest);

// Search users by email or name
router.get("/search", verifyToken, searchUsers);

export default router;
