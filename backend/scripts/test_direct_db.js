const mongoose = require('mongoose');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Feedback = require('../models/Feedback');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function testDirectDB() {
  console.log('=== Direct DB Write Test ===\n');
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // 1. Create a test user (Donor)
    console.log('Step 1: Create test donor user');
    const donor = new User({
      username: `DirectTestDonor${Date.now()}`,
      email: `directdonor${Date.now()}@test.com`,
      password: 'hashed_pass',
      userType: 'Donor',
      isVerified: true,
      address: 'Direct Test Addr',
      phone: '9999999999',
      age: 30
    });
    const savedDonor = await donor.save();
    console.log('✓ Donor created:', savedDonor._id.toString(), '\n');

    // 2. Create a test receiver
    console.log('Step 2: Create test receiver user');
    const receiver = new User({
      username: `DirectTestReceiver${Date.now()}`,
      email: `directreceiver${Date.now()}@test.com`,
      password: 'hashed_pass',
      userType: 'Receiver',
      isVerified: true,
      address: 'Direct Test Addr 2',
      phone: '8888888888',
      age: 25
    });
    const savedReceiver = await receiver.save();
    console.log('✓ Receiver created:', savedReceiver._id.toString(), '\n');

    // 3. Create a test donation
    console.log('Step 3: Create test donation');
    const donation = new Donation({
      donor: savedDonor._id,
      receiver: savedReceiver._id,
      forDonation: 'Receiver',
      amount: 750,
      paymentMethod: 'UPI',
      message: 'Direct write test donation',
      date: new Date()
    });
    const savedDonation = await donation.save();
    console.log('✓ Donation created:', savedDonation._id.toString(), '\n');

    // 4. Create test feedback
    console.log('Step 4: Create test feedback');
    const feedback = new Feedback({
      name: 'Direct Test User',
      message: 'This is a direct DB write test feedback'
    });
    const savedFeedback = await feedback.save();
    console.log('✓ Feedback created:', savedFeedback._id.toString(), '\n');

    // 5. Verify all writes
    console.log('Step 5: Verify data in DB');
    
    const donorFromDB = await User.findById(savedDonor._id);
    console.log('✓ Donor in DB:', donorFromDB?.username);

    const donationFromDB = await Donation.findById(savedDonation._id)
      .populate('donor', 'username')
      .populate('receiver', 'username');
    console.log('✓ Donation in DB: ₹' + donationFromDB?.amount + ' from ' + donationFromDB?.donor?.username + ' to ' + donationFromDB?.receiver?.username);

    const feedbackFromDB = await Feedback.findById(savedFeedback._id);
    console.log('✓ Feedback in DB: "' + feedbackFromDB?.message.substring(0, 40) + '..."\n');

    // 6. Show last few records
    console.log('Step 6: Last 5 donations in database:');
    const donations = await Donation.find().sort({ date: -1 }).limit(5).populate('donor', 'username').populate('receiver', 'username');
    donations.forEach((d, i) => {
      console.log(`  ${i + 1}. ₹${d.amount} from ${d.donor?.username || 'N/A'} to ${d.receiver?.username || 'N/A'}`);
    });

    console.log('\nStep 7: Last 5 feedbacks in database:');
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(5);
    feedbacks.forEach((f, i) => {
      console.log(`  ${i + 1}. "${f.message.substring(0, 40)}..." by ${f.name}`);
    });

    await mongoose.disconnect();
    console.log('\n=== ✓ Direct DB Test Complete - All writes successful ===');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

testDirectDB();
