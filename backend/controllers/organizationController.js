const Organization = require('../models/Ngo');

exports.registerOrganization = async (req, res) => {
  try {
    const { name, registrationNumber, email, phone, address } = req.body;
    const exists = await Organization.findOne({ registrationNumber });
    if (exists) return res.status(400).json({ message: 'Organization already registered' });

    const org = new Organization({
      name, registrationNumber, email, phone, address,
      createdBy: req.user.id
    });

    await org.save();
    res.status(201).json({ message: 'Organization registered successfully', org });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
