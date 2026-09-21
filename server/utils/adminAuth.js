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
| ADMIN COOKIE OPTIONS
|--------------------------------------------------------------------------
*/

export const getAdminCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    /*
     * HTTPS only in production.
     * localhost can use HTTP.
     */
    secure: isProduction,

    /*
     * Works for our current same-site setup.
     */
    sameSite: "lax",

    /*
     * Cookie is only needed by API routes.
     */
    path: "/",

    /*
     * Match JWT lifetime.
     */
    maxAge: 8 * 60 * 60 * 1000,
  };
};

/*
|--------------------------------------------------------------------------
| COOKIE CLEAR OPTIONS
|--------------------------------------------------------------------------
*/

export const getAdminClearCookieOptions =
  () => {
    const isProduction =
      process.env.NODE_ENV ===
      "production";

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    };
  };