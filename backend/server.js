require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const donationRoutes = require('./routes/donation');
const receiversRoutes = require('./routes/receivers');
const notificationRoutes = require('./routes/notification');

const donorDashboardRoutes = require('./routes/donorDashboard');
const receiverDashboardRoutes = require('./routes/receiverDashboard');
const staffDashboardRoutes = require('./routes/staffDashboard');
const statsRoutes = require('./routes/statsRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const homeRoutes = require('./routes/home');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// CORS setup
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'null'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/donation', donationRoutes);
app.use('/api/receivers', receiversRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/donor/dashboard', donorDashboardRoutes);
app.use('/api/receiver/dashboard', receiverDashboardRoutes);
app.use('/api/staff/dashboard', staffDashboardRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/home', homeRoutes);

// Root route (must be before 404 handler)
app.get('/', (req, res) => {
  res.send('Online Donation Management System API');
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Online Donation Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      feedback: '/api/feedback',
      donation: '/api/donation',
      receivers: '/api/receivers',
      notifications: '/api/notifications',
      stats: '/api/stats',
      home: '/api/home',
      donorDashboard: '/api/donor/dashboard',
      receiverDashboard: '/api/receiver/dashboard',
      staffDashboard: '/api/staff/dashboard',
      organizations: '/api/organizations'
    }
  });
});

// 404 handler for unmatched routes (must be last)
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: '/api'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
});
