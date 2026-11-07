const express = require('express');
const router = express.Router();
const MaintenanceStaff = require('../models/MaintenanceStaff');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/staff
router.get('/', requireAuth, async (req, res) => {
  try {
    const staff = await MaintenanceStaff.find().sort({ role: 1, name: 1 });
    res.json(staff);
  } catch (err) {
    console.error('Fetch staff error:', err);
    res.status(500).json({ error: 'Failed to fetch staff members' });
  }
});

// POST /api/staff - Add staff
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, role, phone, email } = req.body;
    if (!name || !role || !phone) {
      return res.status(400).json({ error: 'Name, role, and phone number are required' });
    }

    const staffId = `stf-${Date.now().toString().slice(-4)}`;
    const newStaff = await MaintenanceStaff.create({
      staff_id: staffId,
      name,
      role,
      phone,
      email: email || '',
      status: 'Available'
    });

    res.status(201).json({
      message: 'Staff member added',
      staff: newStaff
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add staff' });
  }
});

// PUT /api/staff/:id/status
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await MaintenanceStaff.updateOne({ staff_id: id }, { $set: { status } });
    res.json({ message: 'Staff status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update staff status' });
  }
});

module.exports = router;
