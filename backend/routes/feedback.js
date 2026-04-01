const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Optional protection

// Get all feedback (public for homepage testimonials)
router.get('/', feedbackController.getAllFeedback);

// Submit feedback (protected route)
router.post('/', authMiddleware, feedbackController.createFeedback);

module.exports = router;
