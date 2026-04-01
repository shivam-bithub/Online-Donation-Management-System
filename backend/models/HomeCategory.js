const mongoose = require('mongoose');

const homeCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, default: 'donation.html' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HomeCategory', homeCategorySchema);


