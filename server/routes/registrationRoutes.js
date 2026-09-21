import express from "express";

import {
  validateRegistration,
  getPassByToken,
   retrievePass,
} from "../controllers/registrationController.js";

import {
  registrationLimiter,
   passRecoveryLimiter,
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


router.post(
  "/retrieve-pass",
  passRecoveryLimiter,
  retrievePass
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