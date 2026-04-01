const mongoose = require('mongoose');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Feedback = require('../models/Feedback');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function testE2E() {
  console.log('=== E2E Test: Register, Login, Create Donation & Feedback ===\n');

  try {
    // Connect to MongoDB
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Step 1: Register a Donor
    console.log('Step 1: Register Donor via API (using fetch)');
    const donorEmail = `donor${Date.now()}@test.com`;
    const donorRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `TestDonor${Date.now()}`,
        email: donorEmail,
        password: 'TestPass123',
        userType: 'Donor',
        address: '123 Main St',
        phone: '1234567890',
        age: 30
      })
    });
    const donorData = await donorRes.json();
    console.log('Response:', donorData.message || donorData);
    if (!donorRes.ok) throw new Error('Donor registration failed: ' + JSON.stringify(donorData));
    console.log('✓ Donor registered\n');

    // Step 2: Register a Receiver
    console.log('Step 2: Register Receiver via API');
    const receiverEmail = `receiver${Date.now()}@test.com`;
    const receiverRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `TestReceiver${Date.now()}`,
        email: receiverEmail,
        password: 'TestPass123',
        userType: 'Receiver',
        address: '456 Oak Ave',
        phone: '0987654321',
        age: 25
      })
    });
    const receiverData = await receiverRes.json();
    console.log('Response:', receiverData.message || receiverData);
    if (!receiverRes.ok) throw new Error('Receiver registration failed');
    console.log('✓ Receiver registered\n');

    // Step 3: Login as Donor
    console.log('Step 3: Login as Donor');
    const donorLoginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: donorEmail,
        password: 'TestPass123',
        userType: 'Donor'
      })
    });
    const donorLoginData = await donorLoginRes.json();
    console.log('Response:', donorLoginData);
    if (!donorLoginRes.ok) throw new Error('Donor login failed');
    const donorToken = donorLoginData.token;
    const donorId = donorLoginData.userId;
    console.log('✓ Donor logged in, userId:', donorId, '\n');

    // Step 4: Login as Receiver
    console.log('Step 4: Login as Receiver');
    const receiverLoginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: receiverEmail,
        password: 'TestPass123',
        userType: 'Receiver'
      })
    });
    const receiverLoginData = await receiverLoginRes.json();
    if (!receiverLoginRes.ok) throw new Error('Receiver login failed');
    const receiverId = receiverLoginData.userId;
    console.log('✓ Receiver logged in, userId:', receiverId, '\n');

    // Step 5: Create a Donation
    console.log('Step 5: Create Donation via API');
    const donationRes = await fetch('http://localhost:3000/api/donation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donorToken}`
      },
      body: JSON.stringify({
        amount: 500,
        paymentMethod: 'UPI',
        message: 'Test donation for e2e',
        forDonation: 'Receiver',
        receiverId: receiverId
      })
    });
    const donationData = await donationRes.json();
    console.log('Response:', donationData);
    if (!donationRes.ok) throw new Error('Donation creation failed: ' + JSON.stringify(donationData));
    console.log('✓ Donation created\n');

    // Step 6: Create Feedback
    console.log('Step 6: Create Feedback via API');
    const feedbackRes = await fetch('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${donorToken}`
      },
      body: JSON.stringify({
        name: 'Test User',
        message: 'Great platform for donations!'
      })
    });
    const feedbackData = await feedbackRes.json();
    console.log('Response:', feedbackData);
    if (!feedbackRes.ok) throw new Error('Feedback creation failed');
    console.log('✓ Feedback created\n');

    // Step 7: Verify data in MongoDB
    console.log('Step 7: Verify data in MongoDB');
    const donations = await Donation.find().sort({ date: -1 }).limit(3).populate('donor', 'username').populate('receiver', 'username');
    console.log('✓ Last 3 donations in DB:');
    donations.forEach(d => {
      console.log(`  - ₹${d.amount} from ${d.donor?.username || 'N/A'} to ${d.receiver?.username || 'N/A'}`);
    });

    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(3);
    console.log('\n✓ Last 3 feedbacks in DB:');
    feedbacks.forEach(f => {
      console.log(`  - "${f.message.substring(0, 50)}..." by ${f.name}`);
    });

    const userCount = await User.countDocuments();
    console.log('\n✓ Total users in DB:', userCount);

    await mongoose.disconnect();
    console.log('\n=== ✓ E2E Test Complete - Data successfully saved to MongoDB ===');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

// Wait for server and run test
async function main() {
  let serverReady = false;
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch('http://localhost:3000');
      if (res.ok || res.status === 404) {
        serverReady = true;
        console.log('✓ Server is ready\n');
        break;
      }
    } catch (e) {
      if (i < 14) {
        console.log(`Waiting for server... (${i + 1}/15)`);
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
  if (!serverReady) throw new Error('Server did not start');
  await testE2E();
}

main();
