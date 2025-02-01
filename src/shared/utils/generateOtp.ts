import crypto from "crypto";

export function generateOTP(length = 6) {
  const digits = "123456789";
  let otp = "";

  length = 6;

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }

  return otp;
}
