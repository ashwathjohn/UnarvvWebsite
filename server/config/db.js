import mongoose from "mongoose";

let cachedConnection = null;

const connectDB =
  async () => {
    /*
    |--------------------------------------------------------------------------
    | REUSE EXISTING CONNECTION
    |--------------------------------------------------------------------------
    */

    if (
      mongoose.connection
        .readyState === 1
    ) {
      return mongoose.connection;
    }

    /*
    |--------------------------------------------------------------------------
    | REUSE CONNECTION PROMISE
    |--------------------------------------------------------------------------
    */

    if (cachedConnection) {
      return cachedConnection;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE ENVIRONMENT
    |--------------------------------------------------------------------------
    */

    if (
      !process.env.MONGODB_URI
    ) {
      throw new Error(
        "MONGODB_URI is not configured."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CONNECT
    |--------------------------------------------------------------------------
    */

    cachedConnection =
      mongoose
        .connect(
          process.env.MONGODB_URI
        )
        .then(
          (mongooseInstance) => {
            console.log(
              "MongoDB connected."
            );

            return mongooseInstance;
          }
        )
        .catch((error) => {
          /*
           * Allow a future request to retry
           * if this connection failed.
           */
          cachedConnection =
            null;

          throw error;
        });

    return cachedConnection;
  };

export default connectDB;