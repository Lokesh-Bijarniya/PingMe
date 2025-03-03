import express from 'express';
import passport from 'passport';
import { registerUser, loginUser , getMe} from '../controllers/authController.js';
import googleLogin  from '../config/googleAuthController.js';
import verifyToken from '../middleware/authMiddleware.js';
import { updateProfile, changePassword, deleteAccount, searchUsers } from '../controllers/authController.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// Manual Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me',getMe);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleLogin);


// Protect these routes with verifyToken middleware
router.put("/update-profile", verifyToken, upload.single("avatar"), updateProfile);
router.post("/change-password", verifyToken, changePassword);
router.delete("/delete-account", verifyToken, deleteAccount);
// router.post("/add-friend", verifyToken, addFriend);
// router.get("/friends/:userId", verifyToken, getFriends);
// router.delete("/remove-friend", authMiddleware, removeFriend);
// router.get("/friend-requests", authMiddleware, getFriendRequests);
// router.post("/accept-request", authMiddleware, acceptRequest);
// router.delete("/reject-request", authMiddleware, rejectRequest);

// Search users by email or name
router.get("/search", verifyToken, searchUsers);

export default router;

