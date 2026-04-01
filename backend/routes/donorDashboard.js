// routes/donorDashboard.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const Donation = require('../models/Donation');

router.get('/donations', authMiddleware, async (req, res) => {
  if (req.user.userType !== 'Donor') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate('receiver', 'username email')
      .sort({ date: -1 }); // Sort by most recent first
    
    res.json({ donations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

