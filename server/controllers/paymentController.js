import crypto from "crypto";

import razorpay from "../config/razorpay.js";

import PaymentOrder from "../models/PaymentOrder.js";
import Registration from "../models/Registration.js";
import verifyWebhookSignature
  from "../utils/verifyWebhookSignature.js";

import { registrationSchema } from "../schemas/registrationSchema.js";

import {
  normalizeEmail,
  normalizeName,
  normalizeParish,
  normalizePhone,
} from "../utils/normalize.js";

import { finalizePaidOrder } from "../services/paymentService.js";

/*
|--------------------------------------------------------------------------
| EVENT PAYMENT CONFIGURATION
|--------------------------------------------------------------------------
|
| Razorpay uses the smallest currency unit.
|
| ₹300 = 30000 paise
|
| IMPORTANT:
| Never accept the registration amount from the frontend.
|
*/

const REGISTRATION_AMOUNT = 30000;
const CURRENCY = "INR";

/*
|--------------------------------------------------------------------------
| CREATE RAZORPAY ORDER
|--------------------------------------------------------------------------
|
| POST /api/payments/create-order
|
| Flow:
|
| 1. Receive participant details
| 2. Normalize data
| 3. Validate with Zod
| 4. Check if participant already registered
| 5. Create internal PaymentOrder
| 6. Create Razorpay order
| 7. Save Razorpay order ID
| 8. Return order details to frontend
|
*/

export const createPaymentOrder = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Normalize participant data
    |--------------------------------------------------------------------------
    */

    const normalizedData = {
      fullName: normalizeName(req.body.fullName),

      email: normalizeEmail(req.body.email),

      phone: normalizePhone(req.body.phone),

      parish: normalizeParish(req.body.parish),

      jerseySize: req.body.jerseySize?.trim().toUpperCase(),
    };

    /*
    |--------------------------------------------------------------------------
    | Validate participant
    |--------------------------------------------------------------------------
    */

    const validation = registrationSchema.safeParse(normalizedData);

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Please check your registration details.",
        errors,
      });
    }

    const participant = validation.data;

    /*
    |--------------------------------------------------------------------------
    | Check confirmed registration
    |--------------------------------------------------------------------------
    |
    | We only check confirmed PAID registrations.
    |
    | Failed/cancelled payment attempts should not stop someone from trying
    | again.
    |
    */

    const existingRegistration = await Registration.findOne({
      $or: [
        { email: participant.email },
        { phone: participant.phone },
      ],

      paymentStatus: "paid",
    }).select(
      "registrationId email phone ticketToken paymentStatus"
    );

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        code: "ALREADY_REGISTERED",
        message:
          "A confirmed registration already exists for this participant.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create our internal payment order
    |--------------------------------------------------------------------------
    |
    | This is NOT a confirmed registration.
    |
    */

    const paymentOrder = await PaymentOrder.create({
      fullName: participant.fullName,

      email: participant.email,

      phone: participant.phone,

      parish: participant.parish,

      jerseySize: participant.jerseySize,

      amount: REGISTRATION_AMOUNT,

      currency: CURRENCY,

      status: "created",

      processed: false,
    });

    /*
    |--------------------------------------------------------------------------
    | Create Razorpay order
    |--------------------------------------------------------------------------
    */

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: REGISTRATION_AMOUNT,

        currency: CURRENCY,

        receipt: paymentOrder._id.toString(),

        notes: {
          internalOrderId: paymentOrder._id.toString(),
          event: "UNARVV26",
        },
      });

      /*
      |--------------------------------------------------------------------------
      | Validate Razorpay response
      |--------------------------------------------------------------------------
      */

      if (!razorpayOrder?.id) {
        throw new Error(
          "Razorpay did not return a valid order ID."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Save Razorpay order ID
      |--------------------------------------------------------------------------
      */

      paymentOrder.razorpayOrderId = razorpayOrder.id;

      await paymentOrder.save();

      /*
      |--------------------------------------------------------------------------
      | Send safe information to frontend
      |--------------------------------------------------------------------------
      |
      | RAZORPAY_KEY_SECRET is NEVER returned.
      |
      | keyId is safe to use with Razorpay Checkout.
      |
      */

      return res.status(201).json({
        success: true,

        message: "Payment order created successfully.",

        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },

        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (razorpayError) {
      /*
      |--------------------------------------------------------------------------
      | Razorpay order creation failed
      |--------------------------------------------------------------------------
      */

      paymentOrder.status = "failed";

      paymentOrder.failureReason =
        "Unable to create Razorpay payment order.";

      await paymentOrder.save();

      throw razorpayError;
    }
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| VERIFY PAYMENT
|--------------------------------------------------------------------------
|
| POST /api/payments/verify
|
| Expected body:
|
| {
|   razorpay_order_id,
|   razorpay_payment_id,
|   razorpay_signature
| }
|
| This endpoint decides whether registration is actually confirmed.
|
*/

export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Check required Razorpay fields
    |--------------------------------------------------------------------------
    */

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        code: "INCOMPLETE_PAYMENT_DATA",
        message: "Incomplete payment verification data.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find trusted order in OUR database
    |--------------------------------------------------------------------------
    |
    | We do not blindly trust the order information sent from the browser.
    |
    */

    const paymentOrder = await PaymentOrder.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!paymentOrder) {
      return res.status(404).json({
        success: false,
        code: "PAYMENT_ORDER_NOT_FOUND",
        message: "Payment order was not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Check if already processed
    |--------------------------------------------------------------------------
    |
    | This makes the endpoint idempotent for repeated verification requests.
    |
    */

    if (paymentOrder.processed) {
      const existingRegistration = await Registration.findOne({
        razorpayOrderId: paymentOrder.razorpayOrderId,
      });

      if (existingRegistration) {
        return res.status(200).json({
          success: true,

          alreadyProcessed: true,

          message: "Registration is already confirmed.",

          registration: {
            registrationId:
              existingRegistration.registrationId,

            ticketToken:
              existingRegistration.ticketToken,

            fullName:
              existingRegistration.fullName,
          },
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Razorpay Checkout signature
    |--------------------------------------------------------------------------
    |
    | Signature:
    |
    | HMAC_SHA256(
    |   razorpayOrderId + "|" + razorpayPaymentId,
    |   RAZORPAY_KEY_SECRET
    | )
    |
    | IMPORTANT:
    | The order ID used here comes from OUR MongoDB record.
    |
    */

    const signatureBody =
      `${paymentOrder.razorpayOrderId}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(signatureBody)
      .digest("hex");

    /*
    |--------------------------------------------------------------------------
    | Constant-time signature comparison
    |--------------------------------------------------------------------------
    */

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    const signatureValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PAYMENT_SIGNATURE",
        message: "Payment signature verification failed.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch payment directly from Razorpay
    |--------------------------------------------------------------------------
    |
    | Signature verification alone isn't where we stop.
    |
    | We also check:
    |
    | payment exists
    | order ID
    | amount
    | currency
    | captured status
    |
    */

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (!payment?.id) {
      return res.status(400).json({
        success: false,
        code: "PAYMENT_NOT_FOUND",
        message: "Unable to verify payment with Razorpay.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify payment belongs to our Razorpay order
    |--------------------------------------------------------------------------
    */

    if (
      payment.order_id !== paymentOrder.razorpayOrderId
    ) {
      return res.status(400).json({
        success: false,
        code: "ORDER_MISMATCH",
        message:
          "Payment does not belong to this registration order.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify payment ID
    |--------------------------------------------------------------------------
    */

    if (payment.id !== razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        code: "PAYMENT_ID_MISMATCH",
        message: "Payment ID verification failed.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify amount
    |--------------------------------------------------------------------------
    |
    | Expected:
    |
    | 30000 paise = ₹300
    |
    */

    if (
      Number(payment.amount) !==
      Number(paymentOrder.amount)
    ) {
      return res.status(400).json({
        success: false,
        code: "AMOUNT_MISMATCH",
        message: "Payment amount verification failed.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify currency
    |--------------------------------------------------------------------------
    */

    if (
      String(payment.currency).toUpperCase() !==
      String(paymentOrder.currency).toUpperCase()
    ) {
      return res.status(400).json({
        success: false,
        code: "CURRENCY_MISMATCH",
        message: "Payment currency verification failed.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify payment captured
    |--------------------------------------------------------------------------
    |
    | We only confirm registration after a captured payment.
    |
    */

    if (payment.status !== "captured") {
      return res.status(409).json({
        success: false,

        code: "PAYMENT_NOT_CAPTURED",

        paymentStatus: payment.status,

        message:
          "Payment has not been captured yet. Please do not make another payment immediately.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Additional captured flag check
    |--------------------------------------------------------------------------
    */

    if (payment.captured !== true) {
      return res.status(409).json({
        success: false,

        code: "PAYMENT_NOT_CAPTURED",

        message:
          "Payment capture has not been confirmed yet.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PAYMENT VERIFIED
    |--------------------------------------------------------------------------
    |
    | Only now do we create the confirmed participant.
    |
    */

    const registration = await finalizePaidOrder({
      paymentOrder,

      razorpayPaymentId: razorpay_payment_id,
    });

    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message:
        "Payment verified and registration confirmed.",

      registration: {
        registrationId: registration.registrationId,

        ticketToken: registration.ticketToken,

        fullName: registration.fullName,

        email: registration.email,

        parish: registration.parish,

        jerseySize: registration.jerseySize,
      },
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Razorpay/API/Database error
    |--------------------------------------------------------------------------
    |
    | Pass it to your existing Express error middleware.
    |
    */

    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
|
| POST /api/payments/webhook
|
| Recovery path for successful captured payments.
|
| This does NOT replace /verify.
|
| Normal flow:
|
| Checkout
|   ↓
| /verify
|   ↓
| finalizePaidOrder()
|
| Recovery flow:
|
| Razorpay
|   ↓
| payment.captured
|   ↓
| /webhook
|   ↓
| finalizePaidOrder()
|
*/

export const razorpayWebhook = async (
  req,
  res,
  next
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. CHECK WEBHOOK CONFIGURATION
    |--------------------------------------------------------------------------
    */

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Webhook configuration error.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 2. READ RAZORPAY SIGNATURE
    |--------------------------------------------------------------------------
    */

    const signature =
      req.get(
        "x-razorpay-signature"
      );

    if (!signature) {
      return res.status(400).json({
        success: false,
        code:
          "WEBHOOK_SIGNATURE_MISSING",
        message:
          "Webhook signature is missing.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 3. VERIFY WEBHOOK SIGNATURE
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | req.rawBody contains the ORIGINAL bytes
    | received from Razorpay.
    |
    */

    const signatureValid =
      verifyWebhookSignature({
        rawBody: req.rawBody,
        signature,
        secret: webhookSecret,
      });

    if (!signatureValid) {
      console.warn(
        "Rejected Razorpay webhook with invalid signature."
      );

      return res.status(400).json({
        success: false,
        code:
          "INVALID_WEBHOOK_SIGNATURE",
        message:
          "Webhook signature verification failed.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 4. READ EVENT
    |--------------------------------------------------------------------------
    |
    | We only use payment.captured to finalize
    | UNARVV registrations.
    |
    */

    const event =
      String(
        req.body?.event || ""
      ).trim();

    /*
    |--------------------------------------------------------------------------
    | 5. IGNORE EVENTS WE DO NOT PROCESS
    |--------------------------------------------------------------------------
    |
    | Return 200 so Razorpay knows the webhook
    | was received successfully.
    |
    */

    if (
      event !==
      "payment.captured"
    ) {
      return res.status(200).json({
        success: true,
        ignored: true,
        event,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 6. EXTRACT PAYMENT ENTITY
    |--------------------------------------------------------------------------
    */

    const webhookPayment =
      req.body?.payload
        ?.payment
        ?.entity;

    if (!webhookPayment?.id) {
      return res.status(400).json({
        success: false,
        code:
          "INVALID_WEBHOOK_PAYLOAD",
        message:
          "Webhook payment data is missing.",
      });
    }

    const razorpayPaymentId =
      webhookPayment.id;

    const razorpayOrderId =
      webhookPayment.order_id;

    if (!razorpayOrderId) {
      /*
       * This payment is not associated with
       * one of our Razorpay Orders.
       *
       * It cannot be used to create an
       * UNARVV registration.
       */

      return res.status(200).json({
        success: true,
        ignored: true,
        message:
          "Payment is not associated with an order.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 7. FIND OUR TRUSTED INTERNAL ORDER
    |--------------------------------------------------------------------------
    */

    const paymentOrder =
      await PaymentOrder.findOne({
        razorpayOrderId,
      });

    if (!paymentOrder) {
      /*
       * Valid Razorpay webhook, but the order
       * does not belong to this application.
       *
       * Do not create a registration.
       */

      console.warn(
        "Webhook received for unknown Razorpay order:",
        razorpayOrderId
      );

      return res.status(200).json({
        success: true,
        ignored: true,
        message:
          "Order does not belong to this registration system.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 8. FETCH PAYMENT DIRECTLY FROM RAZORPAY
    |--------------------------------------------------------------------------
    |
    | We do not rely only on webhook payload data
    | before issuing an event ticket.
    |
    */

    const payment =
      await razorpay.payments.fetch(
        razorpayPaymentId
      );

    if (!payment?.id) {
      throw new Error(
        "Razorpay payment could not be fetched during webhook processing."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 9. VERIFY PAYMENT ID
    |--------------------------------------------------------------------------
    */

    if (
      payment.id !==
      razorpayPaymentId
    ) {
      console.error(
        "Webhook payment ID mismatch."
      );

      return res.status(400).json({
        success: false,
        code:
          "PAYMENT_ID_MISMATCH",
        message:
          "Webhook payment verification failed.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 10. VERIFY ORDER
    |--------------------------------------------------------------------------
    */

    if (
      payment.order_id !==
      paymentOrder.razorpayOrderId
    ) {
      console.error(
        "Webhook Razorpay order mismatch."
      );

      return res.status(400).json({
        success: false,
        code:
          "ORDER_MISMATCH",
        message:
          "Webhook order verification failed.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 11. VERIFY AMOUNT
    |--------------------------------------------------------------------------
    |
    | paymentOrder.amount was created by OUR server.
    |
    | For UNARVV:
    |
    | ₹300 = 30000 paise
    |
    */

    if (
      Number(payment.amount) !==
      Number(paymentOrder.amount)
    ) {
      console.error(
        "Webhook payment amount mismatch."
      );

      return res.status(400).json({
        success: false,
        code:
          "AMOUNT_MISMATCH",
        message:
          "Webhook payment amount verification failed.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 12. VERIFY CURRENCY
    |--------------------------------------------------------------------------
    */

    if (
      String(
        payment.currency
      ).toUpperCase() !==
      String(
        paymentOrder.currency
      ).toUpperCase()
    ) {
      console.error(
        "Webhook payment currency mismatch."
      );

      return res.status(400).json({
        success: false,
        code:
          "CURRENCY_MISMATCH",
        message:
          "Webhook payment currency verification failed.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 13. VERIFY CAPTURED STATE
    |--------------------------------------------------------------------------
    */

    if (
      payment.status !==
        "captured" ||
      payment.captured !== true
    ) {
      /*
       * Do not create a ticket.
       *
       * Since this handler is specifically for
       * payment.captured, this would indicate that
       * the authoritative payment fetch does not
       * currently agree with the event.
       */

      console.warn(
        "Webhook payment is not captured:",
        {
          paymentId:
            razorpayPaymentId,
          status:
            payment.status,
          captured:
            payment.captured,
        }
      );

      return res.status(409).json({
        success: false,
        code:
          "PAYMENT_NOT_CAPTURED",
        message:
          "Payment capture could not be confirmed.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 14. FINALIZE REGISTRATION
    |--------------------------------------------------------------------------
    |
    | This is the SAME function used by /verify.
    |
    | finalizePaidOrder() already protects against:
    |
    | - browser + webhook race
    | - duplicate webhook processing
    | - repeated verification
    | - duplicate Razorpay order
    |
    */

    const registration =
      await finalizePaidOrder({
        paymentOrder,
        razorpayPaymentId:
          payment.id,
      });

    /*
    |--------------------------------------------------------------------------
    | 15. WEBHOOK SUCCESS
    |--------------------------------------------------------------------------
    */

    console.log(
      "Razorpay payment.captured webhook processed:",
      {
        razorpayOrderId:
          paymentOrder.razorpayOrderId,

        razorpayPaymentId:
          payment.id,

        registrationId:
          registration.registrationId,
      }
    );

    return res.status(200).json({
      success: true,
      processed: true,
    });
  } catch (error) {
    next(error);
  }
};