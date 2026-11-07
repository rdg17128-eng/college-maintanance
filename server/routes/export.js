const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { requireAdmin } = require('../middleware/auth');

// GET /api/export/csv
router.get('/csv', requireAdmin, async (req, res) => {
  try {
    const { status, category, priority, department } = req.query;

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.category = category;
    if (priority && priority !== 'All') filter.priority = priority;
    if (department && department !== 'All') filter.department = department;

    const complaints = await Complaint.find(filter).sort({ created_date: -1 });

    // Escape CSV values
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'Complaint ID',
      'Reporter Name',
      'Reporter Role',
      'Department',
      'Building',
      'Block',
      'Floor',
      'Room Number',
      'Room Type',
      'Category',
      'Priority',
      'Status',
      'Assigned Staff',
      'Created Date',
      'Resolved Date',
      'Resolution Remarks',
      'Description'
    ];

    const rows = complaints.map(c => [
      escapeCsv(c.complaint_id),
      escapeCsv(c.reporter_name),
      escapeCsv(c.reporter_role),
      escapeCsv(c.department),
      escapeCsv(c.building),
      escapeCsv(c.block),
      escapeCsv(c.floor),
      escapeCsv(c.room_number),
      escapeCsv(c.room_type),
      escapeCsv(c.category),
      escapeCsv(c.priority),
      escapeCsv(c.status),
      escapeCsv(c.assigned_staff || 'Unassigned'),
      escapeCsv(c.created_date ? new Date(c.created_date).toISOString() : ''),
      escapeCsv(c.resolved_date ? new Date(c.resolved_date).toISOString() : 'N/A'),
      escapeCsv(c.resolution_remarks || ''),
      escapeCsv(c.description)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Apex_Campus_Complaints_${timestamp}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

module.exports = router;
