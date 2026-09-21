import crypto from "crypto";

/*
|--------------------------------------------------------------------------
| VERIFY RAZORPAY WEBHOOK SIGNATURE
|--------------------------------------------------------------------------
|
| Razorpay signs webhook requests using HMAC SHA256.
|
| IMPORTANT:
| Signature verification must use the ORIGINAL raw request body.
|
*/

const verifyWebhookSignature = ({
  rawBody,
  signature,
  secret,
}) => {
  if (
    !rawBody ||
    !Buffer.isBuffer(rawBody) ||
    !signature ||
    !secret
  ) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac(
      "sha256",
      secret
    )
    .update(rawBody)
    .digest("hex");

  try {
    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        String(signature),
        "utf8"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    );
  } catch {
    return false;
  }
};

export default verifyWebhookSignature;