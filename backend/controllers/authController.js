import User from '../models/User.js';
import { generateOTP, sendOTP } from '../utils/otpService.js';
import { generateToken } from '../utils/tokenService.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, OTP_CONFIG } from '../config/constants.js';

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to mobile number
 * @access  Public
 */
export const sendOTPController = async (req, res, next) => {
    try {
        const { mobile } = req.body;

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + OTP_CONFIG.EXPIRES_IN_MINUTES * 60 * 1000);

        // Find or create user
        let user = await User.findOne({ mobile });

        if (!user) {
            user = new User({ mobile, otp, otpExpires });
        } else {
            user.otp = otp;
            user.otpExpires = otpExpires;
        }

        await user.save();

        // Send OTP (simulated)
        await sendOTP(mobile, otp);

        res.status(HTTP_STATUS.OK).json({
            message: SUCCESS_MESSAGES.OTP_SENT,
            otp: otp, // Include for testing
            dummyOtp: OTP_CONFIG.DUMMY_OTP
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and return JWT token
 * @access  Public
 */
export const verifyOTPController = async (req, res, next) => {
    try {
        const { mobile, otp } = req.body;

        // Find user
        const user = await User.findOne({ mobile });

        if (!user) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: ERROR_MESSAGES.INVALID_OTP
            });
        }

        // Check OTP expiration
        if (user.otpExpires < Date.now()) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: ERROR_MESSAGES.OTP_EXPIRED
            });
        }

        // Clear OTP after successful verification
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id, user.mobile);

        res.status(HTTP_STATUS.OK).json({
            message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
            token,
            user: {
                id: user._id,
                mobile: user.mobile
            }
        });

    } catch (error) {
        next(error);
    }
};
