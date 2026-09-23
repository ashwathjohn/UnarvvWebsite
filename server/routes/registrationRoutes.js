import express from "express";

import {
  validateRegistration,
  getPassByToken,
} from "../controllers/registrationController.js";

import {
  requestPassOtp,
  verifyPassOtp,
} from "../controllers/passOtpController.js";

import {
  registrationLimiter,
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