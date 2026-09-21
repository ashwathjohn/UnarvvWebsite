import crypto from "crypto";

/*
|--------------------------------------------------------------------------
| PARTICIPANT PASS TOKEN
|--------------------------------------------------------------------------
|
| Used only for:
|
| /pass/:ticketToken
|
*/

export const generateTicketToken = () =>
  crypto
    .randomBytes(32)
    .toString("hex");

/*
|--------------------------------------------------------------------------
| EVENT CHECK-IN TOKEN
|--------------------------------------------------------------------------
|
| This token is intentionally separate from ticketToken.
|
| It is embedded inside the QR code and used only for event check-in.
|
*/

export const generateCheckInToken = () =>
  crypto
    .randomBytes(32)
    .toString("hex");

/*
|--------------------------------------------------------------------------
| PUBLIC REGISTRATION ID
|--------------------------------------------------------------------------
*/

export const generateRegistrationId =
  () => {
    const randomPart =
      crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `UN26-${randomPart}`;
  };