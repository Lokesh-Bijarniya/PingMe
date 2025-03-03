// routes/friendRoutes.js
import express from 'express';
import { 
  sendFriendRequest,
  acceptFriendRequest,
  getFriends
} from '../controllers/friendController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/requests', verifyToken, sendFriendRequest);
router.put('/requests/:requestId', verifyToken, acceptFriendRequest);
router.get('/', verifyToken, getFriends);

export default router;