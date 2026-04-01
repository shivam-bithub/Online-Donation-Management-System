const FeaturedCampaign = require('../models/FeaturedCampaign');
const HomeCategory = require('../models/HomeCategory');
const HomeTestimonial = require('../models/HomeTestimonial');

const listOptions = (Model) => Model.find({}).sort({ order: 1, createdAt: -1 });

exports.getFeatured = async (_req, res) => {
  try {
    const items = await listOptions(FeaturedCampaign).limit(12);
    res.json({ items: items || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFeatured = async (req, res) => {
  try {
    const doc = await FeaturedCampaign.create(req.body || {});
    res.status(201).json({ item: doc });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await FeaturedCampaign.findByIdAndUpdate(id, req.body || {}, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ item: doc });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const out = await FeaturedCampaign.findByIdAndDelete(id);
    if (!out) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Categories
exports.getCategories = async (_req, res) => {
  try {
    const items = await listOptions(HomeCategory).limit(20);
    res.json({ items: items || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const doc = await HomeCategory.create(req.body || {});
    res.status(201).json({ item: doc });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await HomeCategory.findByIdAndUpdate(id, req.body || {}, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ item: doc });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const out = await HomeCategory.findByIdAndDelete(id);
    if (!out) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Testimonials
exports.getTestimonials = async (_req, res) => {
  try {
    const items = await listOptions(HomeTestimonial).limit(12);
    res.json({ items: items || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const doc = await HomeTestimonial.create(req.body || {});
    res.status(201).json({ item: doc });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await HomeTestimonial.findByIdAndUpdate(id, req.body || {}, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ item: doc });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const out = await HomeTestimonial.findByIdAndDelete(id);
    if (!out) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


