// routes/staffDashboard.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Feedback = require('../models/Feedback');

// Get all unverified receivers
router.get('/receivers', authMiddleware, async (req, res) => {
  if (req.user.userType !== 'Staff') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const unverifiedReceivers = await User.find({ userType: 'Receiver', isVerified: false });
    res.json({ unverifiedReceivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify receiver endpoint
router.post('/verify-receiver/:id', authMiddleware, async (req, res) => {
  if (req.user.userType !== 'Staff') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const receiver = await User.findById(req.params.id);
    if (!receiver || receiver.userType !== 'Receiver') {
      return res.status(400).json({ message: 'Receiver not found' });
    }
    receiver.isVerified = true;
    await receiver.save();
    res.json({ message: 'Receiver verified successfully', receiver });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all donations (for staff overview)
router.get('/donations', authMiddleware, async (req, res) => {
  if (req.user.userType !== 'Staff') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const donations = await Donation.find()
      .populate('donor', 'username email')
      .populate('receiver', 'username email')
      .sort({ date: -1 });
    
    res.json({ donations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback (for staff overview)
router.get('/feedbacks', authMiddleware, async (req, res) => {
  if (req.user.userType !== 'Staff') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 });
    
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
