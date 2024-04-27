const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Course = require("../models/Course");
const User = require("../models/User");
const Tag = require("../models/Tags");
require("dotenv").config();

exports.createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body;
        const thumbnail = req.files.thumbnailImage;

        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All Fields are Required"
            })
        }

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: ", instructorDetails);

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details not Found"
            })
        }

        const tagDetails = await Tags.findById(tag);
        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag Details Not Found"
            })
        }

        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        const newCourse = await Course.create({
            courseName, courseDescription, instructor: instructorDetails._id, whatYouWillLearn, price, tag: tagDetails._id, thumbnail: thumbnailImage.secure_url
        })

        await User.findByIdAndUpadate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        )

        await Tag.findByIdAndUpadate(
            { tag: tagDetails._id },
            {
                $push: {
                    courses: newCourse._id
                }
            }
        )

        return res.status(200).json({
            success: true,
            message: "Course Created Successfully",
            data: newCourse
        })
    }
    catch (error) {
        console.log("An Error Occurred While Creating a Course");

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}