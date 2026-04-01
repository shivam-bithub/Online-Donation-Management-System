const mongoose = require('mongoose');
const Organization = require('../models/Ngo');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function registerNGOs() {
  console.log('=== NGO Registration Script ===\n');
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Sample NGO data
    const ngos = [
      {
        name: 'Helping Hands Foundation',
        registrationNumber: 'NGO-001-2024',
        email: 'contact@helpinghands.org',
        phone: '+91-98765-43210',
        address: '123 Main Street, New Delhi, India'
      },
      {
        name: 'Green Earth Initiative',
        registrationNumber: 'NGO-002-2024',
        email: 'info@greenearthinitiative.org',
        phone: '+91-98765-43211',
        address: '456 Eco Park Road, Bangalore, India'
      },
      {
        name: 'Education For All',
        registrationNumber: 'NGO-003-2024',
        email: 'hello@educationforall.org',
        phone: '+91-98765-43212',
        address: '789 Learning Centre, Mumbai, India'
      },
      {
        name: 'Health Care Plus',
        registrationNumber: 'NGO-004-2024',
        email: 'support@healthcareplus.org',
        phone: '+91-98765-43213',
        address: '321 Medical Complex, Chennai, India'
      },
      {
        name: 'Child Welfare Society',
        registrationNumber: 'NGO-005-2024',
        email: 'care@childwelfare.org',
        phone: '+91-98765-43214',
        address: '654 Children Center, Pune, India'
      },
      {
        name: 'Disaster Relief Network',
        registrationNumber: 'NGO-006-2024',
        email: 'emergency@disasterrelief.org',
        phone: '+91-98765-43215',
        address: '987 Relief Hub, Hyderabad, India'
      },
      {
        name: 'Women Empowerment Trust',
        registrationNumber: 'NGO-007-2024',
        email: 'empower@womenempowerment.org',
        phone: '+91-98765-43216',
        address: '147 Empowerment Plaza, Kolkata, India'
      },
      {
        name: 'Senior Citizen Care',
        registrationNumber: 'NGO-008-2024',
        email: 'care@seniorcitizen.org',
        phone: '+91-98765-43217',
        address: '258 Senior Center, Jaipur, India'
      }
    ];

    console.log(`Registering ${ngos.length} NGOs...\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const ngoData of ngos) {
      try {
        // Check if NGO already exists
        const exists = await Organization.findOne({ registrationNumber: ngoData.registrationNumber });
        
        if (exists) {
          console.log(`⊘ Skipped: ${ngoData.name} (already exists)`);
          skipCount++;
          continue;
        }

        // Create new NGO organization
        const org = new Organization(ngoData);
        const saved = await org.save();
        
        console.log(`✓ Registered: ${ngoData.name} (ID: ${saved._id.toString().substring(0, 8)}...)`);
        successCount++;
      } catch (err) {
        console.error(`✗ Failed to register ${ngoData.name}:`, err.message);
      }
    }

    // Verify registrations
    console.log(`\n--- Summary ---`);
    console.log(`✓ Successfully registered: ${successCount}`);
    console.log(`⊘ Skipped (already exist): ${skipCount}`);

    // Show all NGOs in database
    console.log(`\n--- All NGOs in Database ---`);
    const allOrgs = await Organization.find({});
    allOrgs.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`);
      console.log(`   Email: ${org.email}`);
      console.log(`   Reg#: ${org.registrationNumber}\n`);
    });

    console.log(`Total NGOs in database: ${allOrgs.length}`);

    await mongoose.disconnect();
    console.log('\n=== ✓ NGO Registration Complete ===');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

registerNGOs();
