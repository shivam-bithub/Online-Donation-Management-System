// routes/receiverDashboard.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const Donation = require('../models/Donation');
const Feedback = require('../models/Feedback');

router.get('/donations', authMiddleware, async (req, res) => {
  if (req.user.userType !== 'Receiver') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const donationsReceived = await Donation.find({ receiver: req.user.id })
      .populate('donor', 'username email')
      .sort({ date: -1 }); // Sort by most recent first
    
    const feedbacks = await Feedback.find({ userType: 'Receiver', user: req.user.id })
      .sort({ date: -1 });
    
    res.json({ donationsReceived, feedbacks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
