import crypto from 'crypto';

export function generateOTP(length = 6) {
    const digits = '123456789';
    let otp = '';
    
    // Ensure the OTP is exactly 6 digits
    length = 6;  // Set length to 6 to ensure all OTPs are 6 digits
    
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, digits.length);
        otp += digits[randomIndex];
    }
    
    return otp;
}
