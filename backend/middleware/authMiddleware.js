// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('[JWT Error]', err.name, ':', err.message);
      return res.status(403).json({ message: 'Invalid token', error: err.message });
    }
    req.user = user;
    next();
  });
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.userType !== 'Staff') {
    return res.status(403).json({ message: 'Access denied. Staff only.' });
  }
  next();
};

module.exports = { authMiddleware, verifyToken, adminOnly };
