const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run, all } = require('../config/db');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, roleHint } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await get(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [email.trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Role check if route was admin-specific
    if (roleHint === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'This login portal is restricted to authorized administrative personnel only.' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        regNumber: user.reg_number
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword,
      message: 'Logged in successfully'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, regNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({ error: 'Registration is only permitted for Students and Faculty members' });
    }

    const existing = await get(`SELECT user_id FROM users WHERE LOWER(email) = LOWER(?)`, [email.trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userId = `usr-${role.substring(0, 3)}-${Date.now().toString().slice(-6)}`;

    await run(`
      INSERT INTO users (user_id, name, email, password, role, department, reg_number, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      name.trim(),
      email.trim(),
      hashedPassword,
      role,
      department || 'General',
      regNumber || '',
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    ]);

    const token = jwt.sign(
      {
        userId,
        name,
        email,
        role,
        department,
        regNumber
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        user_id: userId,
        name,
        email,
        role,
        department,
        reg_number: regNumber,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      },
      message: 'Account registered successfully'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await get(`SELECT user_id, name, email, role, department, reg_number, avatar_url, created_at FROM users WHERE user_id = ?`, [req.user.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const unreadNotifs = await get(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = 0`, [user.user_id]);

    res.json({
      user,
      unreadNotifications: unreadNotifs.count
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// GET /api/auth/demo-users
router.get('/demo-users', async (req, res) => {
  try {
    const users = await all(`
      SELECT user_id, name, email, role, department, reg_number, avatar_url 
      FROM users 
      WHERE email IN ('student@apexcollege.edu', 'faculty@apexcollege.edu', 'admin@apexcollege.edu')
      ORDER BY CASE role WHEN 'student' THEN 1 WHEN 'faculty' THEN 2 ELSE 3 END
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch demo accounts' });
  }
});

module.exports = router;
