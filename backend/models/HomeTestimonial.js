const mongoose = require('mongoose');

const homeTestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quote: { type: String, required: true },
  role: { type: String },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HomeTestimonial', homeTestimonialSchema);


