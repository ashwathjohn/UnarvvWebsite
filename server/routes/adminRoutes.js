import express from "express";

import {
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  getDashboardSummary,
  getAdminRegistrations,
   exportAdminRegistrations,
   checkInByQr,
   checkInManually,
} from "../controllers/adminController.js";

import {
  protectAdmin,
} from "../middleware/authMiddleware.js";

import {
  adminLoginLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ADMIN ROUTE
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  adminLoginLimiter,
  loginAdmin
);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ADMIN ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  protectAdmin,
  getCurrentAdmin
);

router.post(
  "/logout",
  protectAdmin,
  logoutAdmin
);

router.get(
  "/dashboard/summary",
  protectAdmin,
  getDashboardSummary
);

router.get(
  "/registrations/export",
  protectAdmin,
  exportAdminRegistrations
);

router.get(
  "/registrations",
  protectAdmin,
  getAdminRegistrations
);


router.post(
  "/check-in/qr",
  protectAdmin,
  checkInByQr
);

router.post(
  "/check-in/manual",
  protectAdmin,
  checkInManually
);

export default router;