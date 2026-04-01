const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 🌍 Public routes — accessible without auth
router.get('/public', donationController.getPublicDonations);

// 👥 Authenticated routes — only accessible to logged-in users
router.get('/', authMiddleware, donationController.getAllDonations);
router.post('/', authMiddleware, donationController.createDonation);

// NEW: Get donation by ID
router.get('/:id', authMiddleware, donationController.getDonationById);

// NEW: Get filtered/searched donations with pagination
router.get('/search/advanced', authMiddleware, donationController.getDonationsFiltered);

// NEW: Get donation statistics
router.get('/stats/overview', authMiddleware, donationController.getDonationStats);

// NEW: Update donation status (staff only)
router.put('/:id/status', authMiddleware, donationController.updateDonationStatus);

// NEW: Request refund
router.post('/:id/refund', authMiddleware, donationController.requestRefund);

// 🔹 Fetch list of registered NGOs
router.get('/ngos', authMiddleware, donationController.getRegisteredNgos);

// 🔹 Fetch list of registered Receivers
router.get('/receivers', authMiddleware, donationController.getRegisteredReceivers);

module.exports = router;
