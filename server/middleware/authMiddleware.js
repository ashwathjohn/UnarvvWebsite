import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";

/*
|--------------------------------------------------------------------------
| PROTECT ADMIN ROUTES
|--------------------------------------------------------------------------
*/

export const protectAdmin = async (
  req,
  res,
  next
) => {
  try {
    /*
     * JWT lives inside an HTTP-only cookie.
     *
     * JavaScript in the browser cannot directly
     * read this cookie.
     */
    const token =
      req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is not configured."
      );
    }

    /*
     * Verify signature + expiry.
     */
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded?.adminId) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid administrator session.",
      });
    }

    /*
     * Check that the admin still exists
     * and is still active.
     */
    const admin =
      await Admin.findById(
        decoded.adminId
      ).select("-passwordHash");

    if (!admin || !admin.active) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid administrator session.",
      });
    }

    /*
     * Make authenticated admin available
     * to following controllers.
     */
    req.admin = admin;

    next();
  } catch (error) {
    /*
     * Don't expose JWT internals.
     */
    return res.status(401).json({
      success: false,
      message:
        "Administrator session has expired or is invalid.",
    });
  }
};