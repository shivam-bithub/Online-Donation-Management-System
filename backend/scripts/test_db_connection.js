const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  mongoose.set('strictQuery', false);
  mongoose.set('debug', true);

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Create a quick test document in a diagnostic collection
    const testSchema = new mongoose.Schema({ createdAt: Date, msg: String }, { collection: 'diagnostic_tests' });
    const Test = mongoose.model('DiagnosticTest', testSchema);

    const doc = new Test({ createdAt: new Date(), msg: 'connection test from script' });
    const saved = await doc.save();
    console.log('Saved test doc:', saved._id.toString());

    // Query back last 5 docs
    const docs = await Test.find().sort({ createdAt: -1 }).limit(5).lean();
    console.log('Last docs:', docs);

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (err) {
    console.error('Connection or write failed:', err);
    process.exit(1);
  }
}

main();
