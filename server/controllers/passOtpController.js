import crypto from "crypto";

import Registration from "../models/Registration.js";
import PassOtp from "../models/PassOtp.js";

import {
  sendPassOtpEmail,
} from "../services/emailService.js";


const OTP_EXPIRY_MINUTES = 5;
const OTP_RESEND_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;


// ============================================================
// HELPERS
// ============================================================

const normalizeEmail = (email = "") =>
  String(email).trim().toLowerCase();


const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


const generateOtp = () =>
  crypto.randomInt(100000, 1000000).toString();


const hashOtp = (otp) =>
  crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");


const compareHash = (
  submittedHash,
  storedHash
) => {
  try {
    const a = Buffer.from(
      submittedHash,
      "hex"
    );

    const b = Buffer.from(
      storedHash,
      "hex"
    );

    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(a, b);

  } catch {
    return false;
  }
};


// ============================================================
// REQUEST OTP
// POST /api/registrations/pass/request-otp
// ============================================================

export const requestPassOtp = async (
  req,
  res
) => {
  try {
    const email = normalizeEmail(
      req.body?.email
    );

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }


    // Only confirmed paid registrations
    const registration =
      await Registration.findOne({
        email,
        paymentStatus: "paid",
      }).select("fullName email");


    // Do not reveal whether an email is registered.
    if (!registration) {
      return res.status(200).json({
        success: true,
        message:
          "If this email is associated with a confirmed registration, a verification code has been sent.",
      });
    }


    // Check resend cooldown.
    const existingOtp =
      await PassOtp.findOne({
        email,
      }).sort({
        createdAt: -1,
      });


    if (existingOtp?.lastSentAt) {
      const elapsedSeconds =
        (
          Date.now() -
          new Date(
            existingOtp.lastSentAt
          ).getTime()
        ) / 1000;


      if (
        elapsedSeconds <
        OTP_RESEND_SECONDS
      ) {
        const remaining =
          Math.ceil(
            OTP_RESEND_SECONDS -
              elapsedSeconds
          );

        return res.status(429).json({
          success: false,
          message:
            `Please wait ${remaining} seconds before requesting another code.`,
          retryAfter: remaining,
        });
      }
    }


    const otp = generateOtp();

    const otpHash =
      hashOtp(otp);

    const expiresAt =
      new Date(
        Date.now() +
          OTP_EXPIRY_MINUTES *
            60 *
            1000
      );


    // Only one active OTP per email.
    await PassOtp.deleteMany({
      email,
    });


    const otpRecord =
      await PassOtp.create({
        email,
        otpHash,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      });


    try {
      await sendPassOtpEmail({
        email,
        name: registration.fullName,
        otp,
      });

    } catch (emailError) {

      // Remove OTP if email delivery request failed.
      await PassOtp.deleteOne({
        _id: otpRecord._id,
      });

      console.error(
        "OTP email delivery failed:",
        emailError
      );

      return res.status(503).json({
        success: false,
        message:
          "Unable to send the verification code right now. Please try again.",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "If this email is associated with a confirmed registration, a verification code has been sent.",
    });

  } catch (error) {

    console.error(
      "Request pass OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process your request right now.",
    });
  }
};


// ============================================================
// VERIFY OTP
// POST /api/registrations/pass/verify-otp
// ============================================================

export const verifyPassOtp = async (
  req,
  res
) => {
  try {
    const email = normalizeEmail(
      req.body?.email
    );

    const otp =
      String(
        req.body?.otp || ""
      ).trim();


    if (
      !email ||
      !isValidEmail(email)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }


    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter the 6-digit verification code.",
      });
    }


    const otpRecord =
      await PassOtp.findOne({
        email,
      }).sort({
        createdAt: -1,
      });


    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired verification code.",
      });
    }


    // Expired?
    if (
      otpRecord.expiresAt.getTime() <
      Date.now()
    ) {
      await PassOtp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "This verification code has expired. Please request a new one.",
      });
    }


    // Too many attempts?
    if (
      otpRecord.attempts >=
      MAX_OTP_ATTEMPTS
    ) {
      await PassOtp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new code.",
      });
    }


    const submittedHash =
      hashOtp(otp);

    const isValid =
      compareHash(
        submittedHash,
        otpRecord.otpHash
      );


    if (!isValid) {

      otpRecord.attempts += 1;

      await otpRecord.save();

      const remaining =
        MAX_OTP_ATTEMPTS -
        otpRecord.attempts;


      if (remaining <= 0) {
        await PassOtp.deleteOne({
          _id: otpRecord._id,
        });

        return res.status(429).json({
          success: false,
          message:
            "Too many incorrect attempts. Please request a new code.",
        });
      }


      return res.status(400).json({
        success: false,
        message:
          `Incorrect verification code. ${remaining} attempt${
            remaining === 1 ? "" : "s"
          } remaining.`,
      });
    }


    // Re-check paid status after OTP succeeds.
    const registration =
      await Registration.findOne({
        email,
        paymentStatus: "paid",
      }).select(
        "registrationId ticketToken"
      );


    if (!registration) {

      await PassOtp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(404).json({
        success: false,
        message:
          "Unable to retrieve the pass.",
      });
    }


    // OTP is single-use.
    await PassOtp.deleteOne({
      _id: otpRecord._id,
    });


    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully.",

      registration: {
        registrationId:
          registration.registrationId,

        ticketToken:
          registration.ticketToken,
      },
    });

  } catch (error) {

    console.error(
      "Verify pass OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify the code right now.",
    });
  }
};