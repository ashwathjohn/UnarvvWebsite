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

connectDB().catch(
  (error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  }
);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());

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
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(cookieParser());

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

app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "UNARVV '26 API is running.",
  });
});

// Registration validation
app.use(
  "/api/registrations",
  registrationRoutes
);

// Razorpay payments
app.use(
  "/api/payments",
  paymentRoutes
);

// Admin
app.use(
  "/api/admin",
  adminRoutes
);

app.use(notFound);
app.use(errorHandler);

export default app;