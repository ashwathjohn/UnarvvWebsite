/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

export const notFound = (
  req,
  res
) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  /*
   * Detailed error information is written
   * to server/Vercel logs only.
   *
   * It is NOT exposed to production users.
   */

  console.error(
    "Unhandled API error:",
    {
      method: req.method,
      path: req.originalUrl,
      name: err.name,
      message: err.message,
      stack: err.stack,
    }
  );

  const statusCode =
    res.statusCode === 200
      ? 500
      : res.statusCode;

  res
    .status(statusCode)
    .json({
      success: false,

      message:
        process.env.NODE_ENV ===
        "production"
          ? "Something went wrong."
          : err.message,
    });
};