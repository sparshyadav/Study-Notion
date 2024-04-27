const User = require("../models/User");
const Profile = require("../models/Profile");

exports.updateProfile = async (req, res) => {
    try {
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
        const id = req.user.id;

        if (!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "All Fields are Required"
            })
        }

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            data: profileDetails
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.id;

        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }

        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
        await User.findByIdAndDelete({ _id: id });

        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully"
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Deleting User",
            error: error.message
        })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id;

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success: true,
            message: "User Data Fetched Successfully",
            data: userDetails
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Fetching User Data",
            error: error.message
        })
    }
}