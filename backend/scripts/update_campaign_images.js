require('dotenv').config();
const mongoose = require('mongoose');
const FeaturedCampaign = require('../models/FeaturedCampaign');

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://userdonation:@exampledonation/donation_db';

const imageMapping = {
  1: '/assets/education.jpg',      // Help Children Get Education
  2: '/assets/medical.png',        // Medical Support for Elderly
  3: '/assets/animal.jpeg',        // Animal Welfare Campaign
  4: '/assets/disaster.jpg',       // Disaster Relief Fund
  5: '/assets/disaster.jpg',       // Disaster Relief Fund
  6: '/assets/animal.jpeg',        // Animal Shelter Support
  7: '/assets/donation1.jpg'       // Clean Water Initiative
};

async function updateImages() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const all = await FeaturedCampaign.find({}).sort({ createdAt: 1 });
    console.log(`Updating ${all.length} campaigns with appropriate images...\n`);

    let count = 1;
    for (const campaign of all) {
      const newImage = imageMapping[count];
      if (newImage && campaign.imageUrl !== newImage) {
        await FeaturedCampaign.findByIdAndUpdate(campaign._id, { imageUrl: newImage });
        console.log(`✓ ${campaign.title}`);
        console.log(`  └─ Image: ${newImage}`);
      }
      count++;
    }

    console.log('\n=== ✓ Campaign Images Updated ===\n');

    // Show final state
    const updated = await FeaturedCampaign.find({}).sort({ createdAt: 1 });
    console.log('Final State:\n');
    updated.forEach((c, i) => {
      const percent = Math.round((c.raised / c.goal) * 100);
      console.log(`${i + 1}. ${c.title}`);
      console.log(`   └─ ₹${c.raised.toLocaleString('en-IN')} / ₹${c.goal.toLocaleString('en-IN')} (${percent}%)`);
      console.log(`   └─ Image: ${c.imageUrl}\n`);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

updateImages();
