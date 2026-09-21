import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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

    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },

    paymentStatus: {
      type: String,
      required: true,
      enum: ["paid", "refunded"],
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    ticketToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    checkInToken: {
  type: String,
  unique: true,
  sparse: true,
  index: true,
},

    checkedIn: {
      type: Boolean,
      default: false,
    },

    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model(
  "Registration",
  registrationSchema
);

export default Registration;