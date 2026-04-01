const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get all notifications (protected)
router.get('/', authMiddleware, notificationController.getUserNotifications);

// Get unread count
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// Mark single notification as read
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

// Mark all as read
router.put('/mark-all/read', authMiddleware, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

// Clear all
router.delete('/clear/all', authMiddleware, notificationController.clearAll);

module.exports = router;
