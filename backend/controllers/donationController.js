const Donation = require('../models/Donation');
const User = require('../models/User');
const Ngo = require('../models/Ngo');

// Create donation (supports NGO or Receiver)
exports.createDonation = async (req, res) => {
  try {
    console.log('createDonation called - user:', req.user && req.user.id, 'body:', req.body);
    const { amount, paymentMethod, message, forDonation, ngoId, receiverId } = req.body;

    const donorId = req.user && req.user.id;
    if (!donorId) return res.status(401).json({ message: 'Unauthorized' });

    // Validate donor
    const donor = await User.findById(donorId);
    if (!donor || donor.userType !== 'Donor') {
      return res.status(400).json({ message: 'Invalid donor' });
    }

    // Validate basic fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid donation amount' });
    }

    if (!['UPI', 'Debit/Credit Card', 'Net Banking'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    if (!forDonation || !['Ngo', 'Receiver'].includes(forDonation)) {
      return res.status(400).json({ message: 'Invalid donation target type' });
    }

    const donationData = {
      donor: donorId,
      amount,
      paymentMethod,
      message,
      forDonation
    };

    if (forDonation === 'Ngo') {
      if (!ngoId) return res.status(400).json({ message: 'NGO ID is required' });
      const org = await Ngo.findById(ngoId);
      if (!org) return res.status(400).json({ message: 'Invalid NGO selected' });
      donationData.organization = org._id;
    }

    if (forDonation === 'Receiver') {
      if (!receiverId) return res.status(400).json({ message: 'Receiver ID is required' });
      const receiverUser = await User.findById(receiverId);
      if (!receiverUser || receiverUser.userType !== 'Receiver') {
        return res.status(400).json({ message: 'Invalid receiver selected' });
      }
      donationData.receiver = receiverUser._id;
    }

    const donation = new Donation(donationData);
    await donation.save();

    // Create notifications for receiver/org and donor
    try {
      const notificationController = require('./notificationController');
      if (donation.organization) {
        // notify organization contact (if createdBy exists)
        const org = await Ngo.findById(donation.organization);
        if (org && org.createdBy) {
          notificationController.createNotification(org.createdBy, 'donation_received', 'New donation received', `A donor donated ₹${donation.amount.toLocaleString('en-IN')} to your organization: ${org.name}`, `/organization/${org._id}`);
        }
      }
      if (donation.receiver) {
        const recv = await User.findById(donation.receiver);
        if (recv) {
          notificationController.createNotification(recv._id, 'donation_received', 'New donation received', `You received ₹${donation.amount.toLocaleString('en-IN')} from a donor.`, `/receiver/dashboard`);
        }
      }
      // notify donor
      notificationController.createNotification(donorId, 'donation_sent', 'Donation successful', `Thank you for donating ₹${donation.amount.toLocaleString('en-IN')}.`, `/donor/dashboard`);
    } catch (noteErr) {
      console.warn('Notification creation error:', noteErr.message);
    }

    res.status(201).json({ message: 'Donation successful', donation });
  } catch (err) {
    console.error('Donation error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all donations (admin or donor dashboard)
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'username email')
      .populate('receiver', 'username email userType')
      .populate('organization', 'name email')
      .sort({ date: -1 });

    res.json({ donations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Public donations for homepage
exports.getPublicDonations = async (_req, res) => {
  try {
    const donations = await Donation.find({})
      .populate('donor', 'username')
      .populate('receiver', 'username userType')
      .populate('organization', 'name')
      .sort({ date: -1 })
      .limit(12);

    const sanitized = donations.map(d => ({
      id: d._id,
      donorName: d.donor?.username || 'Anonymous Donor',
      receiverName: d.receiver?.username || d.organization?.name || 'A Receiver',
      type: d.receiver?.userType || (d.organization ? 'NGO' : undefined),
      amount: d.amount,
      paymentMethod: d.paymentMethod,
      message: (d.message || '').slice(0, 120),
      date: d.date
    }));

    res.json({ donations: sanitized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get registered NGOs
exports.getRegisteredNgos = async (req, res) => {
  try {
    const ngos = await Ngo.find({}, 'name email');
    res.status(200).json(ngos);
  } catch (err) {
    console.error('Error fetching NGOs:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get registered Receivers
exports.getRegisteredReceivers = async (req, res) => {
  try {
    const receivers = await User.find({ userType: 'Receiver' }, 'username email');
    res.status(200).json(receivers);
  } catch (err) {
    console.error('Error fetching receivers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// NEW: Get donation by ID with full details
exports.getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id)
      .populate('donor', 'username email')
      .populate('receiver', 'username email')
      .populate('organization', 'name email');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check access: owner, receiver, or staff
    if (req.user) {
      const isOwner = donation.donor.toString() === req.user.id;
      const isReceiver = donation.receiver && donation.receiver.toString() === req.user.id;
      const isStaff = req.user.userType === 'Staff';

      if (!isOwner && !isReceiver && !isStaff) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Get donations with filters and pagination
exports.getDonationsFiltered = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Payment method filter
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
    }

    // Amount range filter
    if (req.query.minAmount || req.query.maxAmount) {
      filter.amount = {};
      if (req.query.minAmount) filter.amount.$gte = parseInt(req.query.minAmount);
      if (req.query.maxAmount) filter.amount.$lte = parseInt(req.query.maxAmount);
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    // Type filter (Ngo or Receiver)
    if (req.query.forDonation) {
      filter.forDonation = req.query.forDonation;
    }

    // Search by donor or receiver name
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { 'donor.username': searchRegex },
        { 'donor.email': searchRegex },
        { 'receiver.username': searchRegex },
        { 'organization.name': searchRegex }
      ];
    }

    // For donor dashboard - only their donations
    if (req.user && req.query.myDonations === 'true') {
      filter.donor = req.user.id;
    }

    const donations = await Donation.find(filter)
      .populate('donor', 'username email')
      .populate('receiver', 'username email')
      .populate('organization', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Donation.countDocuments(filter);

    res.json({
      data: donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Update donation status (admin only)
exports.updateDonationStatus = async (req, res) => {
  try {
    if (req.user.userType !== 'Staff') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { status, transactionId } = req.body;

    if (!['Pending', 'Completed', 'Failed', 'Refunded'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const donation = await Donation.findByIdAndUpdate(
      id,
      {
        status,
        transactionId: transactionId || undefined
      },
      { new: true }
    ).populate('donor').populate('receiver').populate('organization');

    res.json({ message: 'Donation status updated', donation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Request refund
exports.requestRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Only donor can request refund
    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (donation.status === 'Refunded') {
      return res.status(400).json({ message: 'Already refunded' });
    }

    donation.status = 'Refunded';
    donation.refundAmount = donation.amount;
    donation.refundDate = new Date();
    donation.refundReason = reason || 'Requested by donor';

    await donation.save();

    res.json({ message: 'Refund requested successfully', donation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Get donation statistics
exports.getDonationStats = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const totalAmount = await Donation.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const byPaymentMethod = await Donation.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    const byMonth = await Donation.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const topDonors = await Donation.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: '$donor',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'donor' } }
    ]);

    res.json({
      totalDonations,
      totalAmount: totalAmount[0]?.total || 0,
      byPaymentMethod,
      byMonth,
      topDonors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
