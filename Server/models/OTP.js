const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    opt: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60
    }
})

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email From StudyNotion", otp);
        console.log("Email Sent Successfully");
        console.log(mailResponse);
    }
    catch (error) {
        console.log("An Error Occurred While Sending Verification Email");
        console.log(error);
        throw error;
    }
}

OTPSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.opt);
    next();
})

module.exports = mongoose.model("OTP", OTPSchema);