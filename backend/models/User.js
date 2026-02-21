import mongoose from 'mongoose';
import { generateToken } from '../utils/tokenService.js';

const userSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true // Add index for faster queries
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt
});

// Instance method to generate auth token
userSchema.methods.generateAuthToken = function () {
    return generateToken(this._id, this.mobile);
};

// Instance method to check if OTP is valid
userSchema.methods.isOTPValid = function (otp) {
    return this.otp === otp && this.otpExpires > Date.now();
};

const User = mongoose.model('User', userSchema);

export default User;
