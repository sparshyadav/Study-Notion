const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

exports.resetPasswordToken = async (req, res) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: "Your Email is Not Registered with Us"
            })
        }

        const token = crypto.randomUUID();

        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000
            },
            { new: true }
        )

        const url = `http://localhost:3000/update-password/${token}`;

        await mailSender(email, "Password Reset Link", `Password Reset Link ${url}`);

        return res.json({
            success: true,
            message: "Email Sent Successfully",
            data: updatedDetails
        })
    }
    catch (error) {
        console.log("An Error Occurred");
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Reseting Password"
        })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Token is Invalid"
            })
        }

        const userDetails = await User.findOne({ token: token });
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is Invalid"
            })
        }

        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Token is Expired"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: "Password Reset Successful"
        })
    }
    catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Something Went Wrong While Reseting Password"
        })
    }
}