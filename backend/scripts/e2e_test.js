const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Feedback = require('../models/Feedback');

const API = `http://localhost:${process.env.PORT || 3000}/api`;

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function run(){
  console.log('E2E test starting against', API);

  // Connect to DB to verify directly
  await mongoose.connect(process.env.MONGO_URI);

  // Create unique email to avoid collisions
  const time = Date.now();
  const donorEmail = `donor+${time}@example.com`;
  const receiverEmail = `receiver+${time}@example.com`;

  // Register donor
  let res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username: 'E2E Donor', email: donorEmail, password: 'Password123!', userType: 'Donor' })
  });
  console.log('register donor status', res.status);
  await sleep(300);

  // Register receiver
  res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username: 'E2E Receiver', email: receiverEmail, password: 'Password123!', userType: 'Receiver' })
  });
  console.log('register receiver status', res.status);
  await sleep(300);

  // Login donor
  res = await fetch(`${API}/auth/login`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email: donorEmail, password: 'Password123!', userType: 'Donor' })
  });
  const loginJson = await res.json();
  console.log('donor login status', res.status, 'body:', loginJson);

  const token = loginJson.token;
  if (!token) {
    console.error('Login failed, aborting E2E test');
    process.exit(1);
  }

  // Create donation to receiver (use receiver id from DB)
  const receiverUser = await User.findOne({ email: receiverEmail });
  if (!receiverUser) {
    console.error('Could not find receiver in DB after registration');
    process.exit(1);
  }

  res = await fetch(`${API}/donation`, {
    method: 'POST', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + token},
    body: JSON.stringify({ amount: 100, paymentMethod: 'UPI', message: 'E2E test donation', forDonation: 'Receiver', receiverId: receiverUser._id })
  });
  const donationJson = await res.json();
  console.log('create donation status', res.status, donationJson);

  // Create feedback
  res = await fetch(`${API}/feedback`, {
    method: 'POST', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + token},
    body: JSON.stringify({ userId: loginJson.userId, userType: 'Donor', comment: 'E2E feedback test' })
  });
  const feedbackJson = await res.json();
  console.log('create feedback status', res.status, feedbackJson);

  await sleep(300);

  // Query DB directly for last donation and feedback
  const lastDonation = await Donation.findOne({}).sort({ date: -1 }).lean();
  const lastFeedback = await Feedback.findOne({}).sort({ createdAt: -1 }).lean();
  console.log('Last donation (DB):', lastDonation);
  console.log('Last feedback (DB):', lastFeedback);

  await mongoose.disconnect();
  console.log('E2E finished');
}

run().catch(err=>{ console.error('E2E error', err); process.exit(1); });
