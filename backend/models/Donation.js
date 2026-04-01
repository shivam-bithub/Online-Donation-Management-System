const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const donationSchema = new Schema({
  donor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Link to Donor user

  receiver: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  }, // Link to Receiver or NGO

  // If donation is to an organization/NGO, store it here
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
  },

  forDonation: { 
    type: String, 
    enum: ['Ngo', 'Receiver'], 
    required: true 
  }, // Type of donation

  amount: { 
    type: Number, 
    required: true 
  },

  paymentMethod: { 
    type: String,
    enum: ['UPI', 'Debit/Credit Card', 'Net Banking'],
    required: true
  },

  message: { 
    type: String, 
    trim: true 
  },

  // NEW: Status Tracking
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  },

  transactionId: {
    type: String,
    sparse: true
  },

  refundAmount: {
    type: Number,
    default: 0
  },

  refundDate: Date,

  refundReason: String,

  date: { 
    type: Date, 
    default: Date.now 
  },

  // NEW: Anonymous donation option
  isAnonymous: {
    type: Boolean,
    default: false
  },

  // NEW: Receipt URL (for future PDF generation)
  receiptUrl: String
});

module.exports = mongoose.model('Donation', donationSchema);
