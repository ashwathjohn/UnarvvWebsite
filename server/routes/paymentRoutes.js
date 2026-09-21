import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/paymentController.js";

import {
  registrationLimiter,
} from "../middleware/rateLimiter.js";

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
|
| Do NOT use registrationLimiter here.
|
| Razorpay, not the participant's browser,
| calls this endpoint.
|
*/

router.post(
  "/webhook",
  razorpayWebhook
);

/*
|--------------------------------------------------------------------------
| CREATE RAZORPAY ORDER
|--------------------------------------------------------------------------
*/

router.post(
  "/create-order",
  registrationLimiter,
  createPaymentOrder
);

/*
|--------------------------------------------------------------------------
| VERIFY CHECKOUT PAYMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/verify",
  registrationLimiter,
  verifyPayment
);

export default router;