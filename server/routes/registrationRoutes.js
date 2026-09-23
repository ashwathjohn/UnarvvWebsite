import express from "express";

import {
  validateRegistration,
  getPassByToken,
  retrievePass,
} from "../controllers/registrationController.js";

import {
  requestPassOtp,
  verifyPassOtp,
} from "../controllers/passOtpController.js";

import {
  registrationLimiter,
  passRecoveryLimiter,
  passOtpRequestLimiter,
  passOtpVerifyLimiter,
} from "../middleware/rateLimiter.js";


const router = express.Router();


/*
|--------------------------------------------------------------------------
| Validate registration
|--------------------------------------------------------------------------
*/

router.post(
  "/validate",
  registrationLimiter,
  validateRegistration
);


/*
|--------------------------------------------------------------------------
| Existing pass recovery
|--------------------------------------------------------------------------
| TEMPORARILY KEPT
|
| We will remove this only after the Email OTP system has been
| fully tested locally and in production.
|--------------------------------------------------------------------------
*/

router.post(
  "/retrieve-pass",
  passRecoveryLimiter,
  retrievePass
);


/*
|--------------------------------------------------------------------------
| Request pass verification OTP
|--------------------------------------------------------------------------
*/

router.post(
  "/pass/request-otp",
  passOtpRequestLimiter,
  requestPassOtp
);


/*
|--------------------------------------------------------------------------
| Verify pass OTP
|--------------------------------------------------------------------------
*/

router.post(
  "/pass/verify-otp",
  passOtpVerifyLimiter,
  verifyPassOtp
);


/*
|--------------------------------------------------------------------------
| Get confirmed convention pass
|--------------------------------------------------------------------------
*/

router.get(
  "/pass/:token",
  getPassByToken
);


export default router;