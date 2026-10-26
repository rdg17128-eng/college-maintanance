const express = require('express');
const router = express.Router();
const { all, run } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const notifications = await all(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_date DESC 
      LIMIT 50
    `, [userId]);

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

    await run(`
      UPDATE notifications 
      SET read_status = 1 
      WHERE notification_id = ? AND user_id = ?
    `, [id, userId]);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;

    await run(`
      UPDATE notifications 
      SET read_status = 1 
      WHERE user_id = ?
    `, [userId]);

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

module.exports = router;
