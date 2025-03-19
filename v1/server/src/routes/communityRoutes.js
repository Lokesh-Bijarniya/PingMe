import express from 'express';
import {
  createCommunity,
  getCommunities,
  getCommunity,
  getCommunityMessages,
  updateCommunity,
  deleteCommunity,
  addMember,
  removeMember,
  joinCommunity,
  getCommunityMembers,
  leaveCommunity,
} from '../controllers/communityController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Create community
router.post('/', verifyToken, createCommunity);

// Get all communities
router.get('/', verifyToken, getCommunities);

// Get single community
router.get('/:id', verifyToken, getCommunity);

// Get community messages
router.get('/:communityId/messages', verifyToken, getCommunityMessages);


router.post('/:id/leave', verifyToken, leaveCommunity);

// Update community
// router.put('/:id', verifyToken, updateCommunity);

// Delete community
router.delete('/delete/:id', verifyToken, deleteCommunity);

// Invite member
// router.post('/:id/invite', verifyToken, addMember);

// Remove member
// router.delete('/:id/members/:userId', verifyToken, removeMember);

// Join community
router.post('/:id/join', verifyToken, joinCommunity);

// Get community members
router.get('/:id/members', verifyToken, getCommunityMembers);

export default router;