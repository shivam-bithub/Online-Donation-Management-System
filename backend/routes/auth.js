const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const User = require('../models/User');

router.get('/me', verifyToken, authController.getCurrentUser);

// Registration route (POST) - with optional file upload
router.post('/register', upload.single('profilePhoto'), authController.registerUser);

// Login route (POST)
router.post('/login', authController.loginUser);

// NEW: Update profile
router.put('/profile', authMiddleware, authController.updateProfile);

// NEW: Update profile photo
router.post('/profile/photo', authMiddleware, upload.single('profilePhoto'), authController.updateProfilePhoto);

// NEW: Change password
router.post('/change-password', authMiddleware, authController.changePassword);

// Get user details by ID (GET) - protected route
router.get('/user/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username email userType address phone age bio');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
