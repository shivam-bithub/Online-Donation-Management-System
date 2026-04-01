const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.getCurrentUser = async (req, res) => {
  try {
    console.log(req?.user)
    const user = await User.findById(req.user.id).select('-password');
    // Map userType to role for frontend compatibility
    const userObj = user.toObject();
    userObj.role = userObj.userType ? userObj.userType.toLowerCase() : null;
    res.json(userObj);
  } catch (error) {
    console.error('getCurrentUser error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    const user = await User.findOne({ email, userType });
    if (!user) return res.status(400).json({ message: 'Invalid credentials or user type' });

    if (user.userType === 'Receiver' && !user.isVerified) {
      return res.status(403).json({ message: 'Receiver not verified by staff yet' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      userId: user._id,
      userType: user.userType, 
      username: user.username,
      email: user.email  // ADD THIS LINE
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};


exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, userType, address, phone, age } = req.body;

    if (!['Donor', 'Receiver', 'NGO', 'Staff'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Build avatarUrl from uploaded file
    let avatarUrl = '';
    if (req.file) {
      // Create a URL path for the uploaded file
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      userType,
      address,
      phone,
      age,
      avatarUrl,
      isVerified: (userType === 'Receiver' || userType === 'NGO') ? false : true,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully. Receivers and NGOs require verification.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
};

// NEW: Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, address, phone, age, bio } = req.body;

    // Don't allow changing email or userType through this endpoint
    const updateData = {};
    if (username) updateData.username = username;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (age) updateData.age = age;
    if (bio) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Update profile photo
exports.updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No photo file provided' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(userId, { avatarUrl }, { new: true }).select('-password');

    res.json({ message: 'Profile photo updated successfully', avatarUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
