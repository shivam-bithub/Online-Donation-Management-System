const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get all verified receivers
router.get('/verified', authMiddleware, async (req, res) => {
  try {
    const receivers = await User.find({ userType: 'Receiver', isVerified: true })
      .select('username email address phone age');
    
    res.json({ receivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
