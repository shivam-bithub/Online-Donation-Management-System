require('dotenv').config();
const mongoose = require('mongoose');
const FeaturedCampaign = require('../models/FeaturedCampaign');

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://userdonation:@exampledonation/donation_db';

async function seedCampaigns() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Check if campaigns already exist
    const count = await FeaturedCampaign.countDocuments();
    if (count > 0) {
      console.log(`✓ ${count} campaigns already exist. Skipping seed.`);
      await mongoose.connection.close();
      return;
    }

    const campaigns = [
      {
        title: 'Support Mid-day Meals',
        subtitle: 'Help provide nutritious meals to children daily.',
        raised: 125000,
        goal: 300000,
        imageUrl: '/assets/education.jpg',
        order: 1
      },
      {
        title: 'Emergency Medical Aid',
        subtitle: 'Fund urgent treatments for low-income patients.',
        raised: 80000,
        goal: 200000,
        imageUrl: '/assets/medical.png',
        order: 2
      },
      {
        title: 'Back to School Kits',
        subtitle: 'Provide books and supplies to students in need.',
        raised: 55000,
        goal: 150000,
        imageUrl: '/assets/education.jpg',
        order: 3
      },
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

    const created = await FeaturedCampaign.insertMany(campaigns);
    console.log(`\n✓ Successfully created ${created.length} featured campaigns:\n`);
    
    created.forEach((c, i) => {
      const percent = Math.round((c.raised / c.goal) * 100);
      console.log(`  ${i + 1}. ${c.title}`);
      console.log(`     └─ ₹${c.raised.toLocaleString('en-IN')} / ₹${c.goal.toLocaleString('en-IN')} (${percent}%)`);
    });

    console.log('\n=== ✓ Featured Campaigns Seed Complete ===\n');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seedCampaigns();
