import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/paymentController.js";

import {
  registrationLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

// Create Razorpay order
router.post(
  "/create-order",
  registrationLimiter,
  createPaymentOrder
);

// Verify successful Razorpay payment
router.post(
  "/verify",
  registrationLimiter,
  verifyPayment
);

export default router;