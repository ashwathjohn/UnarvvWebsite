import mongoose from "mongoose";

const paymentOrderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    parish: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    jerseySize: {
      type: String,
      required: true,
      enum: [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "XXL",
        "XXXL",
      ],
    },

    amount: {
      type: Number,
      required: true,
      default: 30000,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "created",
        "paid",
        "failed",
        "cancelled",
        "expired",
      ],
      default: "created",
      index: true,
    },

    processed: {
      type: Boolean,
      default: false,
      index: true,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentOrder = mongoose.model(
  "PaymentOrder",
  paymentOrderSchema
);

export default PaymentOrder;