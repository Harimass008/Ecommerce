const { Router } = require( 'express');
const mongoose = require( 'mongoose');
const Product = require( '../models/Product.js');
const { protect, allowRoles } = require( '../middleware/auth.js');
const { asyncHandler } = require( '../utils/asyncHandler.js');
const router = Router();
router.get('/', asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = String(req.query.category).slice(0, 80);
  if (req.query.search) filter.$text = { $search: String(req.query.search).slice(0, 100) };
  const products = await Product.find(filter).populate('seller', 'name').sort({ createdAt: -1 }).limit(100);
  res.json({ products });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate('seller', 'name');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
}));
router.post('/', protect, allowRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const { name, description = '', category, price, stock = 0, imageUrl = '' } = req.body || {};
  if (!name?.trim() || !category?.trim() || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) return res.status(400).json({ message: 'Valid name, category, non-negative price and stock are required' });
  const product = await Product.create({ name: name.trim(), description, category: category.trim(), price: Number(price), stock: Number(stock), imageUrl, seller: req.user._id });
  res.status(201).json({ product });
}));
router.patch('/:id', protect, allowRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (req.user.role !== 'admin' && String(product.seller) !== String(req.user._id)) return res.status(403).json({ message: 'You can only edit your own products' });
  const allowed = ['name', 'description', 'category', 'price', 'stock', 'imageUrl', 'isActive'];
  for (const key of allowed) if (req.body?.[key] !== undefined) product[key] = req.body[key];
  await product.save(); res.json({ product });
}));
router.delete('/:id', protect, allowRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (req.user.role !== 'admin' && String(product.seller) !== String(req.user._id)) return res.status(403).json({ message: 'You can only remove your own products' });
  product.isActive = false; await product.save(); res.json({ message: 'Product removed' });
}));
module.exports = router;
