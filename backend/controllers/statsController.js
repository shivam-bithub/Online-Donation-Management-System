const Donation = require('../models/Donation');
const User = require('../models/User');

exports.getPlatformStats = async (req, res) => {
  try {
    // Aggregate donation stats
    const donationAgg = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          fundsCollected: { $sum: "$amount" }
        }
      }
    ]);

    const donationStats = donationAgg[0] || { totalDonations: 0, fundsCollected: 0 };

    // Count active donors and receivers
    const [activeDonors, totalReceivers] = await Promise.all([
      User.countDocuments({ userType: 'Donor' }),
      User.countDocuments({ userType: 'Receiver' })
    ]);

    res.status(200).json({
      totalDonations: donationStats.totalDonations,
      fundsCollected: donationStats.fundsCollected,
      activeDonors,
      totalReceivers
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to load platform stats' });
  }
};
