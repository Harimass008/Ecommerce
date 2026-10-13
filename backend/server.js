const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const authRoutes = require("./routes/auth");
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin.js');
const app = express();
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
      .split(",")
      .map((s) => s.trim()),
    credentials: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);
app.get("/api/health", (_req, res) =>
  res.json({
    status: "ok",
    service: "Multi-Vendor E-Commerce API",
    timestamp: new Date().toISOString(),
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use((req, res) =>
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.path}` }),
);
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 11000)
    return res
      .status(409)
      .json({ message: "A record with this value already exists" });
  if (err?.name === "ValidationError")
    return res.status(400).json({ message: err.message });
  res
    .status(500)
    .json({
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message || "Internal server error",
    });
});
async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin bootstrap",
    );
    return;
  }
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      name: "Marketplace Admin",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    });
    console.log(`Initial admin created for ${email}`);
  } else if (existing.role !== "admin")
    console.warn(
      "Configured ADMIN_EMAIL already exists but is not an admin. Promote it manually using a secure database/admin procedure.",
    );
}
const port = Number(process.env.PORT || 5000);
connectDB()
  .then(bootstrapAdmin)
  .then(() => {
    app.listen(port, () =>
      console.log(`API listening at http://localhost:${port}`),
    );
  })
  .catch((err) => {
    console.error(`Startup failed: ${err.message}`);
    process.exit(1);
  });
