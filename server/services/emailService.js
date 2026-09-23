import { BrevoClient } from "@getbrevo/brevo";

const getBrevoClient = () => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error(
      "BREVO_API_KEY is not configured."
    );
  }

  return new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
    timeoutInSeconds: 15,
    maxRetries: 1,
  });
};

export const sendPassOtpEmail = async ({
  email,
  name,
  otp,
}) => {
  const senderEmail =
    process.env.OTP_EMAIL_FROM;

  const senderName =
    process.env.OTP_EMAIL_FROM_NAME ||
    "UNARVV '26";

  if (!senderEmail) {
    throw new Error(
      "OTP_EMAIL_FROM is not configured."
    );
  }

  const brevo = getBrevoClient();

  const participantName =
    name?.trim() || "Participant";

  const result =
    await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: senderName,
        email: senderEmail,
      },

      to: [
        {
          email,
          name: participantName,
        },
      ],

      subject:
        "Your UNARVV '26 verification code",

      htmlContent: `
<!DOCTYPE html>
<html>
<body style="
  margin:0;
  padding:20px;
  background:#f4eddf;
  font-family:Arial,sans-serif;
  color:#39231f;
">

  <div style="
    max-width:520px;
    margin:0 auto;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    border:1px solid #eadfd3;
  ">

    <div style="
      background:#971d20;
      padding:28px 20px;
      text-align:center;
      color:#ffffff;
    ">
      <h1 style="
        margin:0;
        font-size:28px;
      ">
        UNARVV '26
      </h1>

      <p style="
        margin:8px 0 0;
        font-size:12px;
        letter-spacing:2px;
      ">
        REFINE • RENEW • REBORN
      </p>
    </div>

    <div style="
      padding:32px 24px;
      text-align:center;
    ">

      <p style="font-size:16px;">
        Hello ${participantName},
      </p>

      <p style="
        color:#77625d;
        line-height:1.6;
      ">
        Use this verification code to retrieve
        your UNARVV '26 pass.
      </p>

      <div style="
        margin:28px auto;
        padding:18px;
        max-width:230px;
        border-radius:14px;
        background:#fff7e5;
        border:1px solid #f0ad0a;
        color:#971d20;
        font-size:34px;
        font-weight:800;
        letter-spacing:8px;
      ">
        ${otp}
      </div>

      <p style="
        color:#77625d;
        font-size:13px;
      ">
        This code expires in
        <strong>5 minutes</strong>.
      </p>

      <p style="
        margin-top:28px;
        color:#9b8984;
        font-size:12px;
        line-height:1.6;
      ">
        If you didn't request your pass,
        you can safely ignore this email.
      </p>

    </div>

    <div style="
      padding:20px;
      background:#faf6ef;
      text-align:center;
      color:#77625d;
      font-size:11px;
      line-height:1.6;
    ">
      17–18 October 2026<br>
      St. Francis School, Kokkada<br>
      SMYM Diocese of Belthangady
    </div>

  </div>

</body>
</html>
      `,

      textContent: `
UNARVV '26
REFINE • RENEW • REBORN

Hello ${participantName},

Your verification code is:

${otp}

This code expires in 5 minutes.

If you didn't request your pass,
you can safely ignore this email.

17–18 October 2026
St. Francis School, Kokkada
SMYM Diocese of Belthangady
      `.trim(),
    });

  return result;
};