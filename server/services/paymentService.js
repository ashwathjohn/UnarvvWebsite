import Registration from "../models/Registration.js";

import {
  generateRegistrationId,
  generateTicketToken,
  generateCheckInToken,
} from "../utils/ticket.js";

/*
|--------------------------------------------------------------------------
| FINALIZE SUCCESSFUL PAYMENT
|--------------------------------------------------------------------------
|
| This function is called ONLY after paymentController has verified:
|
| ✓ Razorpay signature
| ✓ Razorpay payment exists
| ✓ order ID matches
| ✓ amount matches
| ✓ currency matches
| ✓ payment is captured
|
| Its responsibility is to:
|
| 1. Prevent duplicate registrations
| 2. Generate the public registration ID
| 3. Generate the private participant pass token
| 4. Generate the separate QR check-in token
| 5. Create the confirmed registration
| 6. Mark the PaymentOrder as processed
|
*/

export const finalizePaidOrder = async ({
  paymentOrder,
  razorpayPaymentId,
}) => {
  /*
  |--------------------------------------------------------------------------
  | 1. IDEMPOTENCY CHECK
  |--------------------------------------------------------------------------
  |
  | If this Razorpay order has already been processed, return the existing
  | registration instead of creating another registration.
  |
  | This protects against:
  |
  | - repeated frontend verification requests
  | - browser retries
  | - network retries
  | - future webhook/frontend race conditions
  |
  */

  const existingRegistration =
    await Registration.findOne({
      razorpayOrderId:
        paymentOrder.razorpayOrderId,
    });

  if (existingRegistration) {
    /*
    |--------------------------------------------------------------------------
    | REPAIR PAYMENT ORDER STATE
    |--------------------------------------------------------------------------
    |
    | It is possible for the Registration to have been created successfully
    | but for PaymentOrder processing to have been interrupted before its
    | state was updated.
    |
    | In that situation we repair the PaymentOrder instead of creating
    | another registration.
    |
    */

    if (!paymentOrder.processed) {
      paymentOrder.status = "paid";

      paymentOrder.processed = true;

      paymentOrder.processedAt =
        new Date();

      paymentOrder.razorpayPaymentId =
        razorpayPaymentId;

      await paymentOrder.save();
    }

    return existingRegistration;
  }

  /*
  |--------------------------------------------------------------------------
  | 2. GENERATE REGISTRATION IDENTIFIERS
  |--------------------------------------------------------------------------
  |
  | registrationId
  | -------------------------------------------------------------------------
  | Public human-readable ticket ID.
  |
  | Example:
  | UN26-A1B2C3D4
  |
  |
  | ticketToken
  | -------------------------------------------------------------------------
  | Private token used to open the participant pass.
  |
  | /pass/:ticketToken
  |
  |
  | checkInToken
  | -------------------------------------------------------------------------
  | Separate private credential embedded inside the QR code.
  |
  | UNARVV26:<checkInToken>
  |
  | ticketToken and checkInToken MUST remain separate.
  |
  */

  const registrationId =
    generateRegistrationId();

  const ticketToken =
    generateTicketToken();

  const checkInToken =
    generateCheckInToken();

  try {
    /*
    |--------------------------------------------------------------------------
    | 3. CREATE CONFIRMED REGISTRATION
    |--------------------------------------------------------------------------
    |
    | This is the point where the participant becomes officially registered.
    |
    | This function should only be reached after successful Razorpay
    | verification.
    |
    */

    const registration =
      await Registration.create({
        /*
        |--------------------------------------------------------------------------
        | PUBLIC IDENTIFIER
        |--------------------------------------------------------------------------
        */

        registrationId,

        /*
        |--------------------------------------------------------------------------
        | PARTICIPANT INFORMATION
        |--------------------------------------------------------------------------
        */

        fullName:
          paymentOrder.fullName,

        email:
          paymentOrder.email,

        phone:
          paymentOrder.phone,

        parish:
          paymentOrder.parish,

        jerseySize:
          paymentOrder.jerseySize,

        /*
        |--------------------------------------------------------------------------
        | PAYMENT INFORMATION
        |--------------------------------------------------------------------------
        */

        amountPaid:
          paymentOrder.amount,

        currency:
          paymentOrder.currency,

        paymentStatus: "paid",

        razorpayOrderId:
          paymentOrder.razorpayOrderId,

        razorpayPaymentId,

        /*
        |--------------------------------------------------------------------------
        | PARTICIPANT PASS TOKEN
        |--------------------------------------------------------------------------
        |
        | Used ONLY for:
        |
        | /pass/:ticketToken
        |
        */

        ticketToken,

        /*
        |--------------------------------------------------------------------------
        | EVENT CHECK-IN TOKEN
        |--------------------------------------------------------------------------
        |
        | Used ONLY inside the QR credential:
        |
        | UNARVV26:<checkInToken>
        |
        | This is intentionally different from ticketToken.
        |
        */

        checkInToken,

        /*
        |--------------------------------------------------------------------------
        | EVENT CHECK-IN STATE
        |--------------------------------------------------------------------------
        */

        checkedIn: false,

        checkedInAt: null,
      });

    /*
    |--------------------------------------------------------------------------
    | 4. MARK PAYMENT ORDER AS PROCESSED
    |--------------------------------------------------------------------------
    |
    | The Registration now exists successfully.
    |
    | We can therefore mark the internal PaymentOrder as completed.
    |
    */

    paymentOrder.status = "paid";

    paymentOrder.processed = true;

    paymentOrder.processedAt =
      new Date();

    paymentOrder.razorpayPaymentId =
      razorpayPaymentId;

    await paymentOrder.save();

    /*
    |--------------------------------------------------------------------------
    | 5. RETURN CONFIRMED REGISTRATION
    |--------------------------------------------------------------------------
    */

    return registration;
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | 6. DUPLICATE PROTECTION
    |--------------------------------------------------------------------------
    |
    | MongoDB unique indexes provide another protection layer.
    |
    | For example:
    |
    | Request A ─┐
    |            ├─ both try to process the same Razorpay order
    | Request B ─┘
    |
    | One registration succeeds.
    |
    | The second request receives MongoDB duplicate-key error 11000.
    |
    | Instead of failing the entire payment flow, we retrieve and return
    | the registration that was already created.
    |
    | This is especially important when Razorpay webhooks are added later.
    |
    */

    if (error?.code === 11000) {
      const registration =
        await Registration.findOne({
          razorpayOrderId:
            paymentOrder.razorpayOrderId,
        });

      if (registration) {
        /*
         * Repair PaymentOrder if the
         * concurrent request created the
         * registration first.
         */

        if (!paymentOrder.processed) {
          paymentOrder.status =
            "paid";

          paymentOrder.processed =
            true;

          paymentOrder.processedAt =
            new Date();

          paymentOrder.razorpayPaymentId =
            razorpayPaymentId;

          await paymentOrder.save();
        }

        return registration;
      }
    }

    /*
     * Unknown/unexpected database error.
     *
     * Allow the main error middleware to
     * handle it.
     */

    throw error;
  }
};