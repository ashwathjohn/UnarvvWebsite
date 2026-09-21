import jwt from "jsonwebtoken";

/*
|--------------------------------------------------------------------------
| CREATE ADMIN JWT
|--------------------------------------------------------------------------
*/

export const createAdminToken = (adminId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  return jwt.sign(
    {
      adminId: adminId.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
    }
  );
};

/*
|--------------------------------------------------------------------------
| PRODUCTION CHECK
|--------------------------------------------------------------------------
*/

const isProduction = () =>
  process.env.NODE_ENV === "production";

/*
|--------------------------------------------------------------------------
| ADMIN COOKIE OPTIONS
|--------------------------------------------------------------------------
|
| Development:
|   localhost frontend -> localhost backend
|   SameSite=Lax
|   Secure=false
|
| Production:
|   Vercel frontend -> separate Vercel backend
|   SameSite=None
|   Secure=true
|
*/

export const getAdminCookieOptions = () => {
  const production = isProduction();

  return {
    /*
     * Prevent JavaScript in the browser from
     * accessing the authentication token.
     */
    httpOnly: true,

    /*
     * Production is HTTPS, so the cookie should
     * only travel over secure connections.
     */
    secure: production,

    /*
     * Required for our separate frontend/backend
     * production origins.
     */
    sameSite: production
      ? "none"
      : "lax",

    /*
     * Allow the cookie for all API routes.
     */
    path: "/",

    /*
     * Keep cookie lifetime aligned with
     * the 8-hour JWT lifetime.
     */
    maxAge: 8 * 60 * 60 * 1000,
  };
};

/*
|--------------------------------------------------------------------------
| COOKIE CLEAR OPTIONS
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Cookie clearing must use the same relevant
| attributes as the cookie that was created.
|
*/

export const getAdminClearCookieOptions = () => {
  const production = isProduction();

  return {
    httpOnly: true,

    secure: production,

    sameSite: production
      ? "none"
      : "lax",

    path: "/",
  };
};