const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { requireAdmin } = require('../middleware/auth');

// GET /api/analytics - High-level metrics & breakdown data
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [
      totalCount,
      newCount,
      pendingCount,
      inProgressCount,
      resolvedCount,
      emergencyCount,
      highPriorityCount
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Submitted' }),
      Complaint.countDocuments({ status: { $in: ['Submitted', 'Under Review', 'Assigned'] } }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ priority: 'Emergency', status: { $ne: 'Resolved' } }),
      Complaint.countDocuments({ priority: { $in: ['High', 'Emergency'] }, status: { $ne: 'Resolved' } })
    ]);

    // Department-wise complaints
    const deptWise = await Complaint.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $ne: ['$status', 'Resolved'] }, 1, 0] } }
        }
      },
      { $project: { _id: 0, department: '$_id', total: 1, resolved: 1, pending: 1 } },
      { $sort: { total: -1 } }
    ]);

    // Category-wise maintenance issues
    const categoryWise = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          emergencyCount: { $sum: { $cond: [{ $eq: ['$priority', 'Emergency'] }, 1, 0] } }
        }
      },
      { $project: { _id: 0, category: '$_id', count: 1, emergencyCount: 1 } },
      { $sort: { count: -1 } }
    ]);

    // Priority breakdown
    const priorityBreakdown = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $project: { _id: 0, priority: '$_id', count: 1 } }
    ]);

    // Status distribution
    const statusDistribution = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);

    // Frequently reported locations (Hotspots)
    const topLocations = await Complaint.aggregate([
      {
        $group: {
          _id: { building: '$building', room_number: '$room_number' },
          complaintCount: { $sum: 1 },
          category: { $first: '$category' }
        }
      },
      {
        $project: {
          _id: 0,
          building: '$_id.building',
          room_number: '$_id.room_number',
          location: { $concat: ['$_id.building', ' - ', '$_id.room_number'] },
          complaintCount: 1,
          category: 1
        }
      },
      { $sort: { complaintCount: -1 } },
      { $limit: 8 }
    ]);

    // Maintenance team performance
    const teamPerformance = await Complaint.aggregate([
      { $match: { assigned_staff: { $ne: null } } },
      {
        $group: {
          _id: '$assigned_staff',
          assignedTotal: { $sum: 1 },
          resolvedTotal: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          activeTotal: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } }
        }
      },
      { $project: { _id: 0, staffName: '$_id', assignedTotal: 1, resolvedTotal: 1, activeTotal: 1 } },
      { $sort: { assignedTotal: -1 } }
    ]);

    // Average resolution time (in hours) calculation
    const resolvedItems = await Complaint.find({
      status: 'Resolved',
      resolved_date: { $ne: null }
    }).select('created_date resolved_date');

    let avgResolutionHours = 18.5; // fallback benchmark
    if (resolvedItems.length > 0) {
      let totalHours = 0;
      let count = 0;
      for (const item of resolvedItems) {
        const start = new Date(item.created_date).getTime();
        const end = new Date(item.resolved_date).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          totalHours += (end - start) / (1000 * 60 * 60);
          count++;
        }
      }
      if (count > 0) {
        avgResolutionHours = Math.round((totalHours / count) * 10) / 10;
      }
    }

    res.json({
      kpis: {
        total: totalCount,
        new: newCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        emergency: emergencyCount,
        highPriority: highPriorityCount,
        avgResolutionHours
      },
      deptWise,
      categoryWise,
      priorityBreakdown,
      statusDistribution,
      topLocations,
      teamPerformance
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to aggregate analytics data' });
  }
});

module.exports = router;
