const Notification = require('../models/Notification');

// Get all notifications for user with pagination
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: userId })
      .populate('relatedId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: userId });

    res.json({
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({
      user: userId,
      read: false
    });

    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verify ownership
    if (notification.user.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ message: 'Marked as read', notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verify ownership
    if (notification.user.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Notification.findByIdAndDelete(id);

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear all notifications for user
exports.clearAll = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({ user: userId });

    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create notification (internal helper - called by other controllers)
exports.createNotification = async (userId, type, title, message, link = '#', icon = '🔔', relatedId = null) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      link,
      icon,
      relatedId
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};
