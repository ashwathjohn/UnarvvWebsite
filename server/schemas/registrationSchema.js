import { z } from "zod";

const jerseySizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
];

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required.")
    .max(100, "Full name is too long."),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(150),

  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Please provide a valid 10-digit Indian mobile number."
    ),

  parish: z
    .string()
    .trim()
    .min(2, "Parish is required.")
    .max(150, "Parish name is too long."),

  jerseySize: z.enum(jerseySizes, {
    message: "Please select a valid jersey size.",
  }),
});