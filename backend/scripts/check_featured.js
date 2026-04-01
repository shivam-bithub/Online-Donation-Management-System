require('dotenv').config();
const mongoose = require('mongoose');
const FeaturedCampaign = require('../models/FeaturedCampaign');

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://userdonation:@exampledonation/donation_db';

async function updateCampaigns() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Get existing campaigns
    const existing = await FeaturedCampaign.find({}).sort({ order: 1 });
    console.log(`Found ${existing.length} existing campaigns:\n`);
    
    existing.forEach((c, i) => {
      const percent = Math.round((c.raised / c.goal) * 100);
      console.log(`${i + 1}. ${c.title}`);
      console.log(`   └─ ₹${c.raised.toLocaleString('en-IN')} / ₹${c.goal.toLocaleString('en-IN')} (${percent}%)`);
      console.log(`   └─ Image: ${c.imageUrl}\n`);
    });

    // If less than 6 campaigns, add more
    if (existing.length < 6) {
      console.log('Adding more campaigns...\n');
      
      const newCampaigns = [
        {
          title: 'Disaster Relief Fund',
          subtitle: 'Immediate aid for victims of natural disasters.',
          raised: 220000,
          goal: 500000,
          imageUrl: '/assets/disaster.jpg',
          order: 4
        },
        {
          title: 'Animal Shelter Support',
          subtitle: 'Care and rehabilitation for abandoned animals.',
          raised: 45000,
          goal: 100000,
          imageUrl: '/assets/animal.jpeg',
          order: 5
        },
        {
          title: 'Clean Water Initiative',
          subtitle: 'Building wells for communities without access to clean water.',
          raised: 175000,
          goal: 400000,
          imageUrl: '/assets/donation1.jpg',
          order: 6
        }
      ];

      const added = await FeaturedCampaign.insertMany(newCampaigns);
      console.log(`✓ Added ${added.length} new campaigns\n`);

      added.forEach((c, i) => {
        const percent = Math.round((c.raised / c.goal) * 100);
        console.log(`${i + 1}. ${c.title}`);
        console.log(`   └─ ₹${c.raised.toLocaleString('en-IN')} / ₹${c.goal.toLocaleString('en-IN')} (${percent}%)`);
        console.log(`   └─ Image: ${c.imageUrl}\n`);
      });
    }

    const all = await FeaturedCampaign.find({}).sort({ order: 1 });
    console.log(`\n=== Total Campaigns in Database: ${all.length} ===\n`);

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

updateCampaigns();
