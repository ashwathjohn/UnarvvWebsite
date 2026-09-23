import mongoose from "mongoose";

const passOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


// ============================================================
// TTL INDEX
// MongoDB automatically removes expired OTP documents
// ============================================================

passOtpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);


const PassOtp =
  mongoose.models.PassOtp ||
  mongoose.model(
    "PassOtp",
    passOtpSchema
  );


export default PassOtp;