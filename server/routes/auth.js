const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, roleHint } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
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

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      token,
      user: userObj,
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

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userId = `usr-${role.substring(0, 3)}-${Date.now().toString().slice(-6)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;

    const newUser = new User({
      user_id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      department: department || 'General',
      reg_number: regNumber || '',
      avatar_url: avatarUrl
    });

    await newUser.save();

    const token = jwt.sign(
      {
        userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        regNumber: newUser.reg_number
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      token,
      user: userObj,
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
    const user = await User.findOne({ user_id: req.user.userId }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const unreadCount = await Notification.countDocuments({
      user_id: user.user_id,
      read_status: 0
    });

    res.json({
      user: user.toObject(),
      unreadNotifications: unreadCount
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// GET /api/auth/demo-users
router.get('/demo-users', async (req, res) => {
  try {
    const users = await User.find({
      email: { $in: ['student@apexcollege.edu', 'faculty@apexcollege.edu', 'admin@apexcollege.edu'] }
    }).select('-password');

    const roleOrder = { student: 1, faculty: 2, admin: 3 };
    users.sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch demo accounts' });
  }
});

module.exports = router;
