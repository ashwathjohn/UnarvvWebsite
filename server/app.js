import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import registrationRoutes from "./routes/registrationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import {
  apiLimiter,
} from "./middleware/rateLimiter.js";

import {
  errorHandler,
  notFound,
} from "./middleware/errorMiddleware.js";

const app = express();

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

connectDB().catch((error) => {
  console.error(
    "MongoDB connection failed:",
    error.message
  );
});

/*
|--------------------------------------------------------------------------
| TRUST PROXY
|--------------------------------------------------------------------------
|
| Vercel runs the Express application behind a proxy.
| This is also important for rate limiting and secure request handling.
|
*/

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/*
|--------------------------------------------------------------------------
| SECURITY MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| COOKIE PARSER
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| BODY PARSERS
|--------------------------------------------------------------------------
|
| NOTE:
| When we implement the Razorpay webhook later, we will need to handle
| the webhook route carefully so that Razorpay signature verification
| can use the original/raw request body.
|
*/

app.use(
  express.json({
    limit: "20kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20kb",
  })
);

/*
|--------------------------------------------------------------------------
| ROOT HEALTH CHECK
|--------------------------------------------------------------------------
|
| Visiting the Vercel backend URL directly will hit this route.
|
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "UNARVV '26 API",
    message: "Backend is running successfully.",
    environment:
      process.env.NODE_ENV || "development",
  });
});

/*
|--------------------------------------------------------------------------
| API HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "UNARVV '26 API",
    message: "API is healthy.",
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL API RATE LIMITER
|--------------------------------------------------------------------------
|
| Only /api/* requests are rate limited.
| The root health endpoint remains lightweight.
|
*/

app.use("/api", apiLimiter);

/*
|--------------------------------------------------------------------------
| REGISTRATION ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/registrations",
  registrationRoutes
);

/*
|--------------------------------------------------------------------------
| PAYMENT ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/payments",
  paymentRoutes
);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin",
  adminRoutes
);

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
|
| Must remain AFTER all valid routes.
|
*/

app.use(notFound);

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
|
| Must be the final middleware.
|
*/

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| EXPORT APP
|--------------------------------------------------------------------------
|
| Vercel imports the Express application from this file.
|
*/

export default app;