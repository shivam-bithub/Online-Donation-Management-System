const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['donation_received', 'donation_sent', 'campaign_update', 'verification', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: '#'
  },
  read: {
    type: Boolean,
    default: false
  },
  icon: String, // emoji or icon class
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: function() { return this.type === 'donation_received' || this.type === 'donation_sent' ? 'Donation' : 'FeaturedCampaign'; }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
