
const jwt = require('jsonwebtoken');
const User = require('../models/User.js')
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return res.status(401).json({ message: 'Account unavailable' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
}
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
  next();
};
module.exports = { protect, allowRoles };
