const express = require('express');
const router = express.Router();
const { get, run, all } = require('../config/db');
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
    await run(`
      INSERT INTO notifications (user_id, complaint_id, title, message, read_status)
      VALUES (?, ?, ?, ?, 0)
    `, [userId, complaintId, title, message]);
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

    let query = `SELECT * FROM complaints WHERE 1=1`;
    const params = [];

    // Role-based isolation
    if (role !== 'admin') {
      query += ` AND reporter_id = ?`;
      params.push(userId);
    } else if (reporterRole) {
      query += ` AND reporter_role = ?`;
      params.push(reporterRole);
    }

    if (status && status !== 'All') {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (category && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (priority && priority !== 'All') {
      query += ` AND priority = ?`;
      params.push(priority);
    }

    if (department && department !== 'All') {
      query += ` AND department = ?`;
      params.push(department);
    }

    if (building && building !== 'All') {
      query += ` AND building = ?`;
      params.push(building);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query += ` AND (
        complaint_id LIKE ? OR 
        description LIKE ? OR 
        room_number LIKE ? OR 
        building LIKE ? OR 
        reporter_name LIKE ? OR
        category LIKE ?
      )`;
      params.push(term, term, term, term, term, term);
    }

    query += ` ORDER BY created_date DESC`;

    const complaints = await all(query, params);
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

    const complaint = await get(`SELECT * FROM complaints WHERE complaint_id = ?`, [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Role verification
    if (role !== 'admin' && complaint.reporter_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view this complaint' });
    }

    // Fetch history
    const history = await all(`
      SELECT * FROM complaint_history 
      WHERE complaint_id = ? 
      ORDER BY timestamp ASC
    `, [id]);

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

    await run(`
      INSERT INTO complaints (
        complaint_id, reporter_id, reporter_name, reporter_role,
        building, block, floor, room_number, room_type, department,
        category, description, image_url, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')
    `, [
      complaintId,
      userId,
      name,
      role,
      building,
      block || '',
      floor,
      roomNumber,
      roomType,
      targetDept,
      category,
      description,
      imageUrl || null,
      priority
    ]);

    // Initial history record
    await run(`
      INSERT INTO complaint_history (complaint_id, previous_status, new_status, updated_by, remarks)
      VALUES (?, NULL, 'Submitted', ?, 'Complaint logged via maintenance portal')
    `, [complaintId, name]);

    // Notify user of successful submission
    await createNotification(
      userId,
      complaintId,
      'Complaint Registered',
      `Your complaint #${complaintId} (${category} in ${building} - ${roomNumber}) has been submitted successfully.`
    );

    // If emergency priority, also notify admins
    if (priority === 'Emergency') {
      const admins = await all(`SELECT user_id FROM users WHERE role = 'admin'`);
      for (const adm of admins) {
        await createNotification(
          adm.user_id,
          complaintId,
          'EMERGENCY ALERT',
          `Emergency priority complaint #${complaintId} logged in ${building} - ${roomNumber} (${category})`
        );
      }
    }

    const created = await get(`SELECT * FROM complaints WHERE complaint_id = ?`, [complaintId]);
    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: created
    });
  } catch (err) {
    console.error('Error submitting complaint:', err);
    res.status(500).json({ error: 'Failed to submit maintenance complaint' });
  }
});

// PUT /api/complaints/:id/status - Update Status (Admin only, or student/faculty reopening)
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, internalNotes } = req.body;
    const { role, name, userId } = req.user;

    const complaint = await get(`SELECT * FROM complaints WHERE complaint_id = ?`, [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check permissions
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only administrative personnel can update status directly' });
    }

    const prevStatus = complaint.status;
    let resolvedDate = complaint.resolved_date;
    if (status === 'Resolved' && !resolvedDate) {
      resolvedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
    } else if (status !== 'Resolved') {
      resolvedDate = null;
    }

    await run(`
      UPDATE complaints 
      SET status = ?, 
          resolution_remarks = COALESCE(?, resolution_remarks),
          internal_notes = COALESCE(?, internal_notes),
          resolved_date = ?,
          updated_date = CURRENT_TIMESTAMP
      WHERE complaint_id = ?
    `, [status, remarks || null, internalNotes || null, resolvedDate, id]);

    // Add audit history
    await run(`
      INSERT INTO complaint_history (complaint_id, previous_status, new_status, updated_by, remarks)
      VALUES (?, ?, ?, ?, ?)
    `, [id, prevStatus, status, name, remarks || `Status transitioned to ${status}`]);

    // Notify original reporter
    await createNotification(
      complaint.reporter_id,
      id,
      `Status Update: ${status}`,
      `Your complaint #${id} status changed to ${status}.${remarks ? ` Note: "${remarks}"` : ''}`
    );

    const updated = await get(`SELECT * FROM complaints WHERE complaint_id = ?`, [id]);
    res.json({
      message: 'Complaint status updated successfully',
      complaint: updated
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

    const complaint = await get(`SELECT * FROM complaints WHERE complaint_id = ?`, [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const prevStatus = complaint.status;
    const newStatus = 'Assigned';

    await run(`
      UPDATE complaints 
      SET assigned_staff = ?,
          assigned_staff_phone = ?,
          target_date = ?,
          status = ?,
          internal_notes = COALESCE(?, internal_notes),
          updated_date = CURRENT_TIMESTAMP
      WHERE complaint_id = ?
    `, [staffName, staffPhone || null, targetDate || null, newStatus, internalNotes || null, id]);

    // Add history record
    await run(`
      INSERT INTO complaint_history (complaint_id, previous_status, new_status, updated_by, remarks)
      VALUES (?, ?, ?, ?, ?)
    `, [id, prevStatus, newStatus, adminName, `Assigned to ${staffName}${targetDate ? ` (Target: ${targetDate})` : ''}`]);

    // Notify reporter
    await createNotification(
      complaint.reporter_id,
      id,
      'Staff Assigned',
      `Technician ${staffName} has been assigned to work on your complaint #${id}.`
    );

    const updated = await get(`SELECT * FROM complaints WHERE complaint_id = ?`, [id]);
    res.json({
      message: 'Staff assigned successfully',
      complaint: updated
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

    const complaint = await get(`SELECT * FROM complaints WHERE complaint_id = ?`, [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (role !== 'admin' && complaint.reporter_id !== userId) {
      return res.status(403).json({ error: 'You are not authorized to reopen this complaint' });
    }

    const prevStatus = complaint.status;
    const newStatus = 'Under Review';

    await run(`
      UPDATE complaints 
      SET status = ?,
          resolved_date = NULL,
          resolution_remarks = ?,
          updated_date = CURRENT_TIMESTAMP
      WHERE complaint_id = ?
    `, [newStatus, `Reopened: ${reason || 'Issue still persists'}`, id]);

    // History record
    await run(`
      INSERT INTO complaint_history (complaint_id, previous_status, new_status, updated_by, remarks)
      VALUES (?, ?, ?, ?, ?)
    `, [id, prevStatus, newStatus, name, `Complaint reopened: ${reason || 'Issue still persists'}`]);

    // If student/faculty reopened, notify admin
    if (role !== 'admin') {
      const admins = await all(`SELECT user_id FROM users WHERE role = 'admin'`);
      for (const adm of admins) {
        await createNotification(
          adm.user_id,
          id,
          'Complaint Reopened',
          `Complaint #${id} was reopened by ${name}: "${reason || 'Issue still persists'}"`
        );
      }
    }

    const updated = await get(`SELECT * FROM complaints WHERE complaint_id = ?`, [id]);
    res.json({
      message: 'Complaint reopened successfully',
      complaint: updated
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

    const complaint = await get(`SELECT * FROM complaints WHERE complaint_id = ?`, [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const newStatus = verified ? 'Resolved' : 'In Progress';
    const resolvedDate = verified ? new Date().toISOString().replace('T', ' ').substring(0, 19) : null;

    await run(`
      UPDATE complaints
      SET status = ?,
          resolution_remarks = ?,
          resolved_date = ?,
          updated_date = CURRENT_TIMESTAMP
      WHERE complaint_id = ?
    `, [newStatus, remarks || (verified ? 'Inspection passed & verified.' : 'Verification failed, further work required.'), resolvedDate, id]);

    await run(`
      INSERT INTO complaint_history (complaint_id, previous_status, new_status, updated_by, remarks)
      VALUES (?, ?, ?, ?, ?)
    `, [id, complaint.status, newStatus, adminName, `Resolution inspection: ${verified ? 'Verified & Approved' : 'Rejected back to In Progress'}. ${remarks || ''}`]);

    await createNotification(
      complaint.reporter_id,
      id,
      verified ? 'Complaint Verified & Resolved' : 'Resolution Check Update',
      verified
        ? `Your complaint #${id} has been verified by the facilities administrator and is officially RESOLVED.`
        : `Admin inspected complaint #${id} and sent it back for additional work: ${remarks || ''}`
    );

    const updated = await get(`SELECT * FROM complaints WHERE complaint_id = ?`, [id]);
    res.json({
      message: verified ? 'Complaint verified and resolved' : 'Complaint sent back for rework',
      complaint: updated
    });
  } catch (err) {
    console.error('Error verifying complaint:', err);
    res.status(500).json({ error: 'Failed to verify complaint' });
  }
});

module.exports = router;
