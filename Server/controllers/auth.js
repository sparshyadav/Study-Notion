const otpGenerator = require("otp-generator");
const User = require("../models/User");
const OTP = require("../models/OTP");

exports.sendOTP = async (req, res) => {
    try {
        // Extract the User's Email from Request Body
        const { email } = req.body;

        // Check if the User Already Exists in the Database, if Exists return error
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User Already Exists"
            })
        }

        // Create a new OPT
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log("OTP Generated: ", otp);

        // Check if the OTP Generated already Exists in the Database, if Exists create a new OTP until you get a Unique one
        const isOTPUnique = await OTP.findOne({ otp });
        while (isOTPUnique) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            isOTPUnique = await OTP.findOne({ otp });
        }

        // When Sure that the OTP is Unique, Store it in Database
        const uniqueOTP = await OTP.create(email, otp);
        console.log("This is the OTP: ", uniqueOTP);

        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            OTP: otp
        })
    }
    catch (error) {
        console.log("An Error Occurred While Sending OTP");
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}