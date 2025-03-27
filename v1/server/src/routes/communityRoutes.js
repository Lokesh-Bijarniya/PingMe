import express from 'express';
import {
  createCommunity,
  getCommunities,
  getCommunityMessages,
  deleteCommunity,
  joinCommunity,
  getCommunityMembers,
  leaveCommunity,
} from '../controllers/communityController.js';
import {verifyToken, requireCommunityAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create community
router.post('/', verifyToken, createCommunity);

// Get all communities
router.get('/', verifyToken, getCommunities);


// Get community messages
router.get('/:communityId/messages', verifyToken, getCommunityMessages);


router.post('/:id/leave', verifyToken, leaveCommunity);


// Delete community
router.delete('/delete/:id', verifyToken, requireCommunityAdmin, deleteCommunity);


// Join community
router.post('/:id/join', verifyToken, joinCommunity);

// Get community members
router.get('/:id/members', verifyToken, getCommunityMembers);

export default router;