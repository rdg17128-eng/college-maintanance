const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

// GET /api/notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const notifications = await Notification.find({ user_id: userId })
      .sort({ created_date: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    await Notification.updateOne(
      { notification_id: id, user_id: userId },
      { $set: { read_status: 1 } }
    );

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;

    await Notification.updateMany(
      { user_id: userId },
      { $set: { read_status: 1 } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

module.exports = router;
