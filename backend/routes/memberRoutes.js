const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  updateMemberStatus,
} = require('../controllers/memberController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getAllMembers);
router.get('/:id', protect, getMemberById);
router.patch('/:id/status', protect, adminOnly, updateMemberStatus);

module.exports = router;