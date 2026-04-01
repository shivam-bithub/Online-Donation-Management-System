const express = require('express');
const router = express.Router();
const { registerOrganization } = require('../controllers/organizationController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', authMiddleware, adminOnly, registerOrganization);

module.exports = router;
