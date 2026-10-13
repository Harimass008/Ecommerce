const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: String,
        quantity: { type: Number, min: 1, required: true },
        unitPrice: { type: Number, min: 0, required: true },
      },
    ],
    total: { type: Number, min: 0, required: true },
    status: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    paymentStatus: {
      type: String,
      enum: ["demo_pending", "paid", "failed", "refunded"],
      default: "demo_pending",
    },
    shippingAddress: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Order", orderSchema);
