const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'apex_maintenance_jwt_secret_key_2026';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Administrator privileges required.' });
    }
  });
}

function requireFacultyOrStudent(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && (req.user.role === 'faculty' || req.user.role === 'student' || req.user.role === 'admin')) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Access denied.' });
    }
  });
}

module.exports = {
  JWT_SECRET,
  requireAuth,
  requireAdmin,
  requireFacultyOrStudent
};
