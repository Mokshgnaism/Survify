import mongoose from "mongoose";
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    codeHash: {
        type: String,
        required: true,
    },
    attempts:{
        type:Number,
        required:true,
        default:3//the technique we will be using is we will give only 3 attempts per one otp. we will make sure that there are no more than 3 otp sent in less than 5 minutes even for registration  
    },
    expiresAt: {
        type: Date,
        required: true,
    },
},{timestamps: true});

export default mongoose.model("OtpModel", otpSchema);