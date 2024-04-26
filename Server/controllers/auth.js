const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
require("dotenv").config();

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

exports.signUp = async (req, res) => {
    try {
        // Extract all the Necessary Information from Request Body
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

        // Check if all the Entries Extracted Exist i.e. are not NULL, or Undefined
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All Fields are Required"
            })
        }

        // Check if Password and confirmPassword Matches
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords doesn't match"
            })
        }

        // Check if the User Exists in the Database
        const ifUserExists = await User.findOne({ email });
        if (ifUserExists) {
            return res.status(400).json({
                success: false,
                message: "User Already Registered"
            })
        }

        // Extract the Most Recent OTP for the User, and If the OTP does not Match, or if it doesn't Exist, return Error
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("OTP: ", recentOtp);
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP Not Found"
            })
        }
        else if (recentOtp.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        // Hash the Password that is to be Stored in the Database
        const hashedPassword = await bcrypt(password, 10);

        // Create a User Profile, so the you can pass it's id into the User Model
        const userProfile = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })

        // Create the User and Store it in Database
        const newUser = await User.create({
            firstName, lastName, email, password: hashedPassword, contactNumber, accountType, additionalDetails: userProfile._id, image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        res.status(200).json({
            success: true,
            message: "User Created Successfully",
            user: newUser
        })
    }
    catch (error) {
        console.log("An Error Occurred While Creating User");
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "User Cannot be Registered"
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All Fields are Required"
            })
        }

        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status().json({
                success: false,
                message: "User Does Not Exist"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            const payload = {
                email: user.email,
                id: user._id,
                role: user.role
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            })

            user.token = token;
            user.password = undefined;

            const options = {
                expiresIn: Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token: token,
                user: user,
                message: "Logged In Successfully"
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password Did Not Match"
            })
        }
    }
    catch (error) {
        console.log("An Error Occurred While Logging In");
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Login Failure"
        })
    }
}