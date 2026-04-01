const mongoose = require('mongoose');

const featuredCampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  raised: { type: Number, default: 0 },
  goal: { type: Number, default: 0 },
  imageUrl: { type: String },
  link: { type: String, default: 'donation.html' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeaturedCampaign', featuredCampaignSchema);


