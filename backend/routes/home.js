const express = require('express');
const router = express.Router();
const {
  getFeatured, createFeatured, updateFeatured, deleteFeatured,
  getCategories, createCategory, updateCategory, deleteCategory,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial
} = require('../controllers/homeController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Public
router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.get('/testimonials', getTestimonials);

// Staff only
router.post('/featured', authMiddleware, adminOnly, createFeatured);
router.put('/featured/:id', authMiddleware, adminOnly, updateFeatured);
router.delete('/featured/:id', authMiddleware, adminOnly, deleteFeatured);

router.post('/categories', authMiddleware, adminOnly, createCategory);
router.put('/categories/:id', authMiddleware, adminOnly, updateCategory);
router.delete('/categories/:id', authMiddleware, adminOnly, deleteCategory);

router.post('/testimonials', authMiddleware, adminOnly, createTestimonial);
router.put('/testimonials/:id', authMiddleware, adminOnly, updateTestimonial);
router.delete('/testimonials/:id', authMiddleware, adminOnly, deleteTestimonial);

module.exports = router;


