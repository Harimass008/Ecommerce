const { Router } = require ( 'express');
const crypto =require ( 'node:crypto');
const bcrypt = require ( 'bcryptjs');
const jwt =  require( 'jsonwebtoken');
const rateLimit = require( 'express-rate-limit');
const User = require ( '../models/User.js');
const { protect } = require('../middleware/auth.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const   sendEmail  = require ( '../services/mailer.js');
const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many password/authentication attempts. Try again later.' } });
const validEmail = (s) => typeof s === 'string' && /^\S+@\S+\.\S+$/.test(s);
const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const signToken = (user) => jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body || {};
  if (!name?.trim() || !validEmail(email) || typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Name, valid email and password (at least 8 characters) are required' });
  if (!['customer', 'seller'].includes(role)) return res.status(400).json({ message: 'Only customer or seller registration is allowed' });
  const normalized = email.trim().toLowerCase();
  if (await User.exists({ email: normalized })) return res.status(409).json({ message: 'An account with this email already exists' });
  const user = await User.create({ name: name.trim(), email: normalized, passwordHash: await bcrypt.hash(password, 12), role });
  try { await sendEmail({ to: user.email, subject: 'Welcome to MarketNest', text: `Hi ${user.name}, your MarketNest account is ready.` }); } catch (e) { console.error('Welcome email failed:', e.message); }
  res.status(201).json({ token: signToken(user), user: safeUser(user) });
}));
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase(); const password = req.body?.password;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive || typeof password !== 'string' || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: signToken(user), user: safeUser(user) });
}));
router.get('/me', protect, (req, res) => res.json({ user: safeUser(req.user) }));
router.post('/change-password', protect, authLimiter, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') return res.status(400).json({ message: 'Current password, new password and confirmation are required' });
  if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
  if (newPassword !== confirmPassword) return res.status(400).json({ message: 'New password and confirmation do not match' });
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(400).json({ message: 'Current password is incorrect' });
  if (await bcrypt.compare(newPassword, user.passwordHash)) return res.status(400).json({ message: 'New password must be different from the current password' });
  user.passwordHash = await bcrypt.hash(newPassword, 12); await user.save();
  try { await sendEmail({ to: user.email, subject: 'MarketNest password changed', text: 'Your MarketNest password was changed. If this was not you, use Forgot password immediately and secure your email account.' }); } catch (e) { console.error('Password-change email failed:', e.message); }
  res.json({ message: 'Password updated successfully. A security email will be sent when email settings are configured.' });
}));
router.post('/forgot-password', authLimiter, asyncHandler(async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (validEmail(email)) {
    const user = await User.findOne({ email }).select('+resetTokenHash +resetTokenExpiresAt');
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000); await user.save();
      const link = `${(process.env.APP_BASE_URL || 'http://localhost:5173').replace(/\/$/, '')}/?resetToken=${encodeURIComponent(token)}`;
      try { await sendEmail({ to: user.email, subject: 'Reset your MarketNest password', text: `Use this secure link within 30 minutes to reset your password:
${link}
If you did not request this, ignore this email.` }); }
      catch (e) { console.error('Password reset email failed:', e.message); if (process.env.NODE_ENV !== 'production') console.log('[DEV RESET LINK]', link); }
    }
  }
  res.json({ message: 'If an account exists for that email, password-reset instructions have been sent.' });
}));
router.post('/reset-password', authLimiter, asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body || {};
  if (typeof token !== 'string' || typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'A valid reset token and password of at least 8 characters are required' });
  if (confirmPassword !== undefined && password !== confirmPassword) return res.status(400).json({ message: 'Password and confirmation do not match' });
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ resetTokenHash: tokenHash, resetTokenExpiresAt: { $gt: new Date() } }).select('+resetTokenHash +resetTokenExpiresAt +passwordHash');
  if (!user) return res.status(400).json({ message: 'Reset link is invalid or expired. Request a new one.' });
  user.passwordHash = await bcrypt.hash(password, 12); user.resetTokenHash = undefined; user.resetTokenExpiresAt = undefined; await user.save();
  try { await sendEmail({ to: user.email, subject: 'MarketNest password reset completed', text: 'Your MarketNest password was reset. If this was not you, contact support and secure your email account.' }); } catch (e) { console.error('Password-reset notification failed:', e.message); }
  res.json({ message: 'Password reset successfully. You can now sign in with your new password.' });
}));
module.exports = router;
