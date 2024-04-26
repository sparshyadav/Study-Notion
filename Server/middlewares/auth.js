const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
    try {
        // Extract Token from Cookie, or Body, or from Header
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer", "");

        // If Token is Invalid, return Error
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is Missing"
            })
        }

        try {
            // Verify the Token, and insert Verified Token in User
            const decode = await jwt.verify(token, proces.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: "Token is Invalid"
            })
        }
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something Went Wrong While Validating the Token"
        })
    }
}