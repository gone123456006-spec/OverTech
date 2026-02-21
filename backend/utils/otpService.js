import { OTP_CONFIG } from '../config/constants.js';

/**
 * Generate OTP
 * Currently returns dummy OTP for development
 * In production, integrate with SMS service
 */
export const generateOTP = () => {
    // For development: always return 1234
    return OTP_CONFIG.DUMMY_OTP;

    // For production: uncomment below to generate random OTP
    // return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Send OTP via SMS
 * Currently simulated with console log
 * In production, integrate with Twilio, AWS SNS, or similar
 */
export const sendOTP = async (mobile, otp) => {
    // Simulated SMS sending
    console.log(`📱 [OTP SENT] Mobile: ${mobile}, OTP: ${otp}`);

    // For production: integrate real SMS service
    // Example with Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    await client.messages.create({
        body: `Your OTP is: ${otp}. Valid for ${OTP_CONFIG.EXPIRES_IN_MINUTES} minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${mobile}`
    });
    */

    return true;
};
