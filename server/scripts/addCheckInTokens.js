import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";

import Registration from "../models/Registration.js";

import {
  generateCheckInToken,
} from "../utils/ticket.js";

const migrateCheckInTokens =
  async () => {
    try {
      await connectDB();

      const registrations =
        await Registration.find({
          paymentStatus: "paid",

          $or: [
            {
              checkInToken: {
                $exists: false,
              },
            },

            {
              checkInToken: null,
            },

            {
              checkInToken: "",
            },
          ],
        });

      console.log(
        `${registrations.length} registration(s) require check-in tokens.`
      );

      for (
        const registration
        of registrations
      ) {
        let saved = false;

        while (!saved) {
          try {
            registration.checkInToken =
              generateCheckInToken();

            await registration.save();

            saved = true;

            console.log(
              `Updated ${registration.registrationId}`
            );
          } catch (error) {
            /*
             * Extremely unlikely duplicate
             * random-token collision.
             */
            if (
              error?.code === 11000
            ) {
              continue;
            }

            throw error;
          }
        }
      }

      console.log(
        "Check-in token migration completed."
      );

      await mongoose.connection.close();

      process.exit(0);
    } catch (error) {
      console.error(
        "Migration failed:",
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

migrateCheckInTokens();