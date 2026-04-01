const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['Donor', 'Receiver', 'NGO', 'Staff'], required: true },
  isVerified: { type: Boolean, default: false },  // Only receivers need verification
  address: { type: String },
  phone: { type: String },
  age: { type: Number },
  bio: { type: String },
  avatarUrl: { type: String },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('User', userSchema);
