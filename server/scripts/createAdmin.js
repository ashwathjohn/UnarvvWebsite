import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

/*
|--------------------------------------------------------------------------
| CREATE INITIAL SUPERADMIN
|--------------------------------------------------------------------------
|
| Usage:
|
| node scripts/createAdmin.js
|
| Credentials come from environment variables.
|
*/

const createAdmin = async () => {
  try {
    const name =
      process.env.INITIAL_ADMIN_NAME
        ?.trim();

    const email =
      process.env.INITIAL_ADMIN_EMAIL
        ?.trim()
        .toLowerCase();

    const password =
      process.env
        .INITIAL_ADMIN_PASSWORD;

    if (
      !name ||
      !email ||
      !password
    ) {
      throw new Error(
        "INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are required."
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      throw new Error(
        "INITIAL_ADMIN_EMAIL is invalid."
      );
    }

    /*
     * Require a reasonably strong
     * initial password.
     */
    if (password.length < 12) {
      throw new Error(
        "Initial admin password must contain at least 12 characters."
      );
    }

    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | PREVENT DUPLICATE ADMIN
    |--------------------------------------------------------------------------
    */

    const existingAdmin =
      await Admin.findOne({
        email,
      });

    if (existingAdmin) {
      console.log(
        "An administrator with this email already exists."
      );

      await mongoose.connection.close();

      process.exit(0);
    }

    /*
    |--------------------------------------------------------------------------
    | HASH PASSWORD
    |--------------------------------------------------------------------------
    */

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    /*
    |--------------------------------------------------------------------------
    | CREATE SUPERADMIN
    |--------------------------------------------------------------------------
    */

    const admin =
      await Admin.create({
        name,
        email,
        passwordHash,
        role: "superadmin",
        active: true,
      });

    console.log(
      `Superadmin created successfully: ${admin.email}`
    );

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Unable to create administrator:",
      error.message
    );

    try {
      await mongoose.connection.close();
    } catch {
      // Ignore close errors.
    }

    process.exit(1);
  }
};

createAdmin();