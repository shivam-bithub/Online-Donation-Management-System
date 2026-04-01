const Feedback = require('../models/Feedback');

// Get all feedback (public for homepage testimonials)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Failed to load feedbacks' });
  }
};

// Add new feedback (protected if desired via route middleware)
exports.createFeedback = async (req, res) => {
  try {
    console.log('createFeedback called - user:', req.body.userId || (req.user && req.user.id), 'body:', req.body);
    // Support two payload shapes:
    // - { name, message }
    // - { userId, userType, comment }
    let name = req.body.name;
    let message = req.body.message;

    if (!name && req.body.userId) {
      try {
        const User = require('../models/User');
        const user = await User.findById(req.body.userId).select('username email');
        if (user) name = user.username || user.email || 'Anonymous';
      } catch (e) {
        // ignore lookup failure
      }
    }

    if (!message && req.body.comment) message = req.body.comment;

    if (!name || !message) {
      return res.status(400).json({ message: 'Name and message are required' });
    }

    const fb = new Feedback({ name, message });
    await fb.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};
