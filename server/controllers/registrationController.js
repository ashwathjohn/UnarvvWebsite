import Registration from "../models/Registration.js";

import { registrationSchema } from "../schemas/registrationSchema.js";

import {
  normalizeEmail,
  normalizeName,
  normalizeParish,
  normalizePhone,
} from "../utils/normalize.js";

/*
|--------------------------------------------------------------------------
| VALIDATE REGISTRATION
|--------------------------------------------------------------------------
|
| Validates participant details before payment.
|
| IMPORTANT:
| This endpoint does NOT create a registration.
|
| Final registration creation happens only after Razorpay payment has
| been successfully verified.
|
*/

export const validateRegistration = async (
  req,
  res,
  next
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | NORMALIZE INPUT
    |--------------------------------------------------------------------------
    */

    const normalizedData = {
      fullName: normalizeName(
        req.body.fullName
      ),

      email: normalizeEmail(
        req.body.email
      ),

      phone: normalizePhone(
        req.body.phone
      ),

      parish: normalizeParish(
        req.body.parish
      ),

      jerseySize:
        req.body.jerseySize
          ?.trim()
          .toUpperCase(),
    };

    /*
    |--------------------------------------------------------------------------
    | VALIDATE INPUT
    |--------------------------------------------------------------------------
    */

    const result =
      registrationSchema.safeParse(
        normalizedData
      );

    if (!result.success) {
      const errors =
        result.error.issues.map(
          (issue) => ({
            field:
              issue.path[0],

            message:
              issue.message,
          })
        );

      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please check your registration details.",

          errors,
        });
    }

    const data = result.data;

    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING CONFIRMED REGISTRATION
    |--------------------------------------------------------------------------
    |
    | Only PAID registrations count as confirmed.
    |
    | Pending/failed/abandoned PaymentOrder attempts do not prevent the
    | participant from registering again.
    |
    */

    const existingRegistration =
      await Registration.findOne({
        $or: [
          {
            email: data.email,
          },

          {
            phone: data.phone,
          },
        ],

        paymentStatus: "paid",
      }).select(
        "registrationId email phone"
      );

    if (existingRegistration) {
      return res
        .status(409)
        .json({
          success: false,

          code:
            "ALREADY_REGISTERED",

          message:
            "A confirmed registration already exists for this participant.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION SUCCESS
    |--------------------------------------------------------------------------
    */

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Registration details are valid.",

        participant: {
          fullName:
            data.fullName,

          email:
            data.email,

          phone:
            data.phone,

          parish:
            data.parish,

          jerseySize:
            data.jerseySize,
        },

        /*
         * Display information only.
         *
         * The actual payment amount must
         * still be controlled by the
         * payment backend.
         */
        event: {
          amount: 30000,
          currency: "INR",
        },
      });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET PARTICIPANT PASS
|--------------------------------------------------------------------------
|
| GET /api/registrations/pass/:token
|
| :token = ticketToken
|
| IMPORTANT SECURITY DESIGN:
|
| ticketToken
|     ↓
| Opens participant pass
|
| checkInToken
|     ↓
| Encoded inside QR
|
| These are two independent random credentials.
|
*/

export const getPassByToken = async (
  req,
  res,
  next
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | READ TICKET TOKEN
    |--------------------------------------------------------------------------
    */

    const token =
      String(
        req.params.token || ""
      ).trim();

    /*
    |--------------------------------------------------------------------------
    | VALIDATE TOKEN FORMAT
    |--------------------------------------------------------------------------
    |
    | generateTicketToken() creates:
    |
    | crypto.randomBytes(32).toString("hex")
    |
    | Therefore a valid current token is
    | exactly 64 hexadecimal characters.
    |
    */

    if (
      !/^[a-f0-9]{64}$/i.test(
        token
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid pass link.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND CONFIRMED REGISTRATION
    |--------------------------------------------------------------------------
    |
    | The URL credential is ticketToken.
    |
    | checkInToken is selected separately because
    | that is what the QR code must contain.
    |
    */

    const registration =
      await Registration.findOne({
        ticketToken: token,

        paymentStatus: "paid",
      })
        .select(
          [
            "registrationId",
            "fullName",
            "parish",
            "jerseySize",
            "paymentStatus",
            "checkedIn",
            "checkedInAt",
            "createdAt",
            "checkInToken",
          ].join(" ")
        )
        .lean();

    /*
    |--------------------------------------------------------------------------
    | PASS NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!registration) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "This UNARVV pass could not be found.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK-IN TOKEN SAFETY CHECK
    |--------------------------------------------------------------------------
    |
    | Existing registrations must be migrated using the Stage 6D migration
    | script before QR check-in is enabled.
    |
    | We do NOT fall back to ticketToken.
    |
    | Falling back would defeat the entire reason for separating the two
    | credentials.
    |
    */

    if (
      !registration.checkInToken ||
      !/^[a-f0-9]{64}$/i.test(
        registration.checkInToken
      )
    ) {
      return res
        .status(503)
        .json({
          success: false,

          code:
            "CHECK_IN_TOKEN_MISSING",

          message:
            "This pass is temporarily unavailable for QR check-in. Please contact the event team.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | RETURN PASS
    |--------------------------------------------------------------------------
    |
    | NOTE:
    |
    | checkInToken is intentionally returned here because the participant
    | pass frontend needs it to generate the QR.
    |
    | It is NOT returned from:
    |
    | - admin participant table API
    | - CSV export
    | - pass retrieval endpoint
    |
    */

    return res
      .status(200)
      .json({
        success: true,

        pass: {
          registrationId:
            registration.registrationId,

          fullName:
            registration.fullName,

          parish:
            registration.parish,

          jerseySize:
            registration.jerseySize,

          paymentStatus:
            registration.paymentStatus,

          checkedIn:
            registration.checkedIn,

          checkedInAt:
            registration.checkedInAt,

          registeredAt:
            registration.createdAt,

          /*
           * IMPORTANT:
           *
           * BEFORE STAGE 6:
           *
           * checkInToken: token
           *
           * AFTER STAGE 6:
           *
           * Separate credential from DB.
           */
          checkInToken:
            registration.checkInToken,
        },

        event: {
          name:
            "UNARVV '26",

          theme:
            "REFINE • RENEW • REBORN",

          dates:
            "17–18 October 2026",

          venue:
            "St. Francis School, Kokkada",
        },
      });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| RETRIEVE LOST PASS
|--------------------------------------------------------------------------
|
| POST /api/registrations/retrieve-pass
|
| Participant supplies:
|
| - registered email
| - registered phone
|
| Both must match the SAME confirmed paid registration.
|
*/

export const retrievePass = async (
  req,
  res,
  next
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | NORMALIZE INPUT
    |--------------------------------------------------------------------------
    */

    const email =
      normalizeEmail(
        req.body.email || ""
      );

    const phone =
      normalizePhone(
        req.body.phone || ""
      );

    /*
    |--------------------------------------------------------------------------
    | BASIC VALIDATION
    |--------------------------------------------------------------------------
    */

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      );

    const validPhone =
      /^[6-9]\d{9}$/.test(
        phone
      );

    if (
      !email ||
      !phone ||
      !validEmail ||
      !validPhone
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please provide a valid registered email address and phone number.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND CONFIRMED REGISTRATION
    |--------------------------------------------------------------------------
    |
    | BOTH email and phone must belong to
    | the same PAID registration.
    |
    */

    const registration =
      await Registration.findOne({
        email,

        phone,

        paymentStatus: "paid",
      })
        .select(
          "registrationId ticketToken"
        )
        .lean();

    /*
    |--------------------------------------------------------------------------
    | NOT FOUND
    |--------------------------------------------------------------------------
    |
    | Generic response intentionally avoids revealing whether:
    |
    | - email exists
    | - phone exists
    | - one field was incorrect
    |
    */

    if (!registration) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "We could not find a confirmed registration matching those details.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    |
    | Only ticketToken is returned.
    |
    | checkInToken is NOT returned from pass recovery.
    |
    */

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Your registration was found.",

        registration: {
          registrationId:
            registration.registrationId,

          ticketToken:
            registration.ticketToken,
        },
      });
  } catch (error) {
    next(error);
  }
};