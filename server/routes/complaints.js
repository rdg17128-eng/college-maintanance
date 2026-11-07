const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Generate unique complaint ID: CMP-2026-XXXX
function generateComplaintId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${year}-${rand}`;
}

// Helper to push notification
async function createNotification(userId, complaintId, title, message) {
  try {
    await Notification.create({
      user_id: userId,
      complaint_id: complaintId,
      title,
      message,
      read_status: 0,
      created_date: new Date()
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

// GET /api/complaints
// Students/Faculty get their own; Admin gets all (with optional filters)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const {
      status,
      category,
      priority,
      department,
      building,
      reporterRole,
      search
    } = req.query;

    const filter = {};

    // Role-based isolation
    if (role !== 'admin') {
      filter.reporter_id = userId;
    } else if (reporterRole) {
      filter.reporter_role = reporterRole;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (building && building !== 'All') {
      filter.building = building;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { complaint_id: regex },
        { description: regex },
        { room_number: regex },
        { building: regex },
        { reporter_name: regex },
        { category: regex }
      ];
    }

    const complaints = await Complaint.find(filter).sort({ created_date: -1 });
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ error: 'Failed to retrieve complaints' });
  }
});

// GET /api/complaints/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    const complaint = await Complaint.findOne({ complaint_id: id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Role verification
    if (role !== 'admin' && complaint.reporter_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view this complaint' });
    }

    const history = await ComplaintHistory.find({ complaint_id: id }).sort({ timestamp: 1 });

    res.json({
      complaint,
      history
    });
  } catch (err) {
    console.error('Error fetching complaint detail:', err);
    res.status(500).json({ error: 'Failed to fetch complaint details' });
  }
});

// POST /api/complaints - Submit new complaint
router.post('/', requireAuth, async (req, res) => {
  try {
    const { userId, name, role, department: userDept } = req.user;
    const {
      building,
      block,
      floor,
      roomNumber,
      roomType,
      department,
      category,
      description,
      imageUrl,
      priority
    } = req.body;

    if (!building || !floor || !roomNumber || !roomType || !category || !description || !priority) {
      return res.status(400).json({ error: 'Please fill in all mandatory fields.' });
    }

    const complaintId = generateComplaintId();
    const targetDept = department || userDept || 'General';

    const newComplaint = new Complaint({
      complaint_id: complaintId,
      reporter_id: userId,
      reporter_name: name,
      reporter_role: role,
      building,
      block: block || '',
      floor,
      room_number: roomNumber,
      room_type: roomType,
      department: targetDept,
      category,
      description,
      image_url: imageUrl || null,
      priority,
      status: 'Submitted',
      created_date: new Date(),
      updated_date: new Date()
    });

    await newComplaint.save();

    // Initial history record
    await ComplaintHistory.create({
      complaint_id: complaintId,
      previous_status: null,
      new_status: 'Submitted',
      updated_by: name,
      remarks: 'Complaint logged via maintenance portal',
      timestamp: new Date()
    });

    // Notify user of successful submission
    await createNotification(
      userId,
      complaintId,
      'Complaint Registered',
      `Your complaint #${complaintId} (${category} in ${building} - ${roomNumber}) has been submitted successfully.`
    );

    // If emergency priority, also notify admins
    if (priority === 'Emergency') {
      const admins = await User.find({ role: 'admin' });
      for (const adm of admins) {
        await createNotification(
          adm.user_id,
          complaintId,
          'EMERGENCY ALERT',
          `Emergency priority complaint #${complaintId} logged in ${building} - ${roomNumber} (${category})`
        );
      }
    }

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: newComplaint
    });
  } catch (err) {
    console.error('Error submitting complaint:', err);
    res.status(500).json({ error: 'Failed to submit maintenance complaint' });
  }
});

// PUT /api/complaints/:id/status - Update Status (Admin only)
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, internalNotes } = req.body;
    const { role, name } = req.user;

    const complaint = await Complaint.findOne({ complaint_id: id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only administrative personnel can update status directly' });
    }

    const prevStatus = complaint.status;
    let resolvedDate = complaint.resolved_date;
    if (status === 'Resolved' && !resolvedDate) {
      resolvedDate = new Date();
    } else if (status !== 'Resolved') {
      resolvedDate = null;
    }

    complaint.status = status;
    if (remarks) complaint.resolution_remarks = remarks;
    if (internalNotes) complaint.internal_notes = internalNotes;
    complaint.resolved_date = resolvedDate;
    complaint.updated_date = new Date();
    await complaint.save();

    // Add audit history
    await ComplaintHistory.create({
      complaint_id: id,
      previous_status: prevStatus,
      new_status: status,
      updated_by: name,
      remarks: remarks || `Status transitioned to ${status}`,
      timestamp: new Date()
    });

    // Notify original reporter
    await createNotification(
      complaint.reporter_id,
      id,
      `Status Update: ${status}`,
      `Your complaint #${id} status changed to ${status}.${remarks ? ` Note: "${remarks}"` : ''}`
    );

    res.json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

// PUT /api/complaints/:id/assign - Assign Maintenance Staff (Admin only)
router.put('/:id/assign', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { staffName, staffPhone, targetDate, internalNotes } = req.body;
    const { name: adminName } = req.user;

    const complaint = await Complaint.findOne({ complaint_id: id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const prevStatus = complaint.status;
    const newStatus = 'Assigned';

    complaint.assigned_staff = staffName;
    if (staffPhone) complaint.assigned_staff_phone = staffPhone;
    if (targetDate) complaint.target_date = new Date(targetDate);
    if (internalNotes) complaint.internal_notes = internalNotes;
    complaint.status = newStatus;
    complaint.updated_date = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaint_id: id,
      previous_status: prevStatus,
      new_status: newStatus,
      updated_by: adminName,
      remarks: `Assigned to ${staffName}${targetDate ? ` (Target: ${targetDate})` : ''}`,
      timestamp: new Date()
    });

    await createNotification(
      complaint.reporter_id,
      id,
      'Staff Assigned',
      `Technician ${staffName} has been assigned to work on your complaint #${id}.`
    );

    res.json({
      message: 'Staff assigned successfully',
      complaint
    });
  } catch (err) {
    console.error('Error assigning staff:', err);
    res.status(500).json({ error: 'Failed to assign maintenance staff' });
  }
});

// POST /api/complaints/:id/reopen - Reopen complaint
router.post('/:id/reopen', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { role, name, userId } = req.user;

    const complaint = await Complaint.findOne({ complaint_id: id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (role !== 'admin' && complaint.reporter_id !== userId) {
      return res.status(403).json({ error: 'You are not authorized to reopen this complaint' });
    }

    const prevStatus = complaint.status;
    const newStatus = 'Under Review';

    complaint.status = newStatus;
    complaint.resolved_date = null;
    complaint.resolution_remarks = `Reopened: ${reason || 'Issue still persists'}`;
    complaint.updated_date = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaint_id: id,
      previous_status: prevStatus,
      new_status: newStatus,
      updated_by: name,
      remarks: `Complaint reopened: ${reason || 'Issue still persists'}`,
      timestamp: new Date()
    });

    if (role !== 'admin') {
      const admins = await User.find({ role: 'admin' });
      for (const adm of admins) {
        await createNotification(
          adm.user_id,
          id,
          'Complaint Reopened',
          `Complaint #${id} was reopened by ${name}: "${reason || 'Issue still persists'}"`
        );
      }
    }

    res.json({
      message: 'Complaint reopened successfully',
      complaint
    });
  } catch (err) {
    console.error('Error reopening complaint:', err);
    res.status(500).json({ error: 'Failed to reopen complaint' });
  }
});

// POST /api/complaints/:id/verify - Admin Verify Resolution
router.post('/:id/verify', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, remarks } = req.body;
    const { name: adminName } = req.user;

    const complaint = await Complaint.findOne({ complaint_id: id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const prevStatus = complaint.status;
    const newStatus = verified ? 'Resolved' : 'In Progress';
    const resolvedDate = verified ? new Date() : null;

    complaint.status = newStatus;
    complaint.resolution_remarks = remarks || (verified ? 'Inspection passed & verified.' : 'Verification failed, further work required.');
    complaint.resolved_date = resolvedDate;
    complaint.updated_date = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaint_id: id,
      previous_status: prevStatus,
      new_status: newStatus,
      updated_by: adminName,
      remarks: `Resolution inspection: ${verified ? 'Verified & Approved' : 'Rejected back to In Progress'}. ${remarks || ''}`,
      timestamp: new Date()
    });

    await createNotification(
      complaint.reporter_id,
      id,
      verified ? 'Complaint Verified & Resolved' : 'Resolution Check Update',
      verified
        ? `Your complaint #${id} has been verified by the facilities administrator and is officially RESOLVED.`
        : `Admin inspected complaint #${id} and sent it back for additional work: ${remarks || ''}`
    );

    res.json({
      message: verified ? 'Complaint verified and resolved' : 'Complaint sent back for rework',
      complaint
    });
  } catch (err) {
    console.error('Error verifying complaint:', err);
    res.status(500).json({ error: 'Failed to verify complaint' });
  }
});

module.exports = router;
