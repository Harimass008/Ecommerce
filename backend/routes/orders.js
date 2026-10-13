const { Router } = require ( 'express');
const mongoose = require ( 'mongoose');
const Product = require ( '../models/Product.js');
const Order = require ( '../models/Order.js');
const { protect, allowRoles } = require ( '../middleware/auth.js');
const { asyncHandler } = require ( '../utils/asyncHandler.js');
const router = Router();
router.post('/', protect, allowRoles('customer'), asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body || {};
  if (!Array.isArray(items) || items.length === 0 || items.length > 50 || !shippingAddress?.trim()) return res.status(400).json({ message: 'Cart items and shipping address are required' });
  const normalized = new Map();
  for (const item of items) {
    const id = String(item.productId || ''); const qty = Number(item.quantity);
    if (!mongoose.isValidObjectId(id) || !Number.isInteger(qty) || qty < 1 || qty > 99) return res.status(400).json({ message: 'Invalid cart item' });
    normalized.set(id, (normalized.get(id) || 0) + qty);
  }
  const ids = [...normalized.keys()]; const products = await Product.find({ _id: { $in: ids }, isActive: true });
  if (products.length !== ids.length) return res.status(400).json({ message: 'One or more products are unavailable' });
  const orderItems = [];
  for (const p of products) {
    const quantity = normalized.get(String(p._id));
    if (p.stock < quantity) return res.status(400).json({ message: `Insufficient stock for ${p.name}` });
    orderItems.push({ product: p._id, seller: p.seller, name: p.name, quantity, unitPrice: p.price });
  }
  // Demo checkout only. Inventory decrement and payment confirmation should be transactional in production.
  const total = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const order = await Order.create({ customer: req.user._id, items: orderItems, total, shippingAddress: shippingAddress.trim() });
  res.status(201).json({ order, notice: 'Demo order created. No payment was collected.' });
}));
router.get('/my', protect, allowRoles('customer'), asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ orders });
}));
router.get('/seller', protect, allowRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { 'items.seller': req.user._id };
  const orders = await Order.find(filter).populate('customer', 'name email').sort({ createdAt: -1 }).limit(100);
  res.json({ orders });
}));
router.patch('/:id/status', protect, allowRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid order ID' });
  const allowed = ['processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(req.body?.status)) return res.status(400).json({ message: 'Invalid status' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (req.user.role !== 'admin' && !order.items.some(i => String(i.seller) === String(req.user._id))) return res.status(403).json({ message: 'This order does not belong to your shop' });
  order.status = req.body.status; await order.save(); res.json({ order });
}));
module.exports = router;
