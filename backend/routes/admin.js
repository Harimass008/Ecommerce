const Router = require("express");

const User   =  require(  '../models/User.js');
const Product   =  require(  '../models/Product.js');
const  Order   =  require(  '../models/Order.js');
const  { protect, allowRoles }   =  require(  '../middleware/auth.js');
const  { asyncHandler }   =  require(  '../utils/asyncHandler.js');


const router = Router();
router.use(protect, allowRoles("admin"));
router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [users, sellers, products, orders, revenue] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);
    res.json({
      overview: {
        users,
        sellers,
        products,
        orders,
        demoOrderValue: revenue[0]?.total || 0,
      },
    });
  }),
);
router.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await User.find()
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ users });
  }),
);
router.patch(
  "/users/:id/role",
  asyncHandler(async (req, res) => {
    if (!["admin", "seller", "customer"].includes(req.body?.role))
      return res.status(400).json({ message: "Invalid role" });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (String(user._id) === String(req.user._id))
      return res
        .status(400)
        .json({ message: "You cannot change your own role" });
    user.role = req.body.role;
    await user.save();
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }),
);
module.exports = router;
