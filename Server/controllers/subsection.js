const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
    try {
        const { sectionId, title, timeDuration, description } = req.body;
        const video = req.files.videoFile;

        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All Fields are Required"
            })
        }

        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        const subSectionDetails = await SubSection.create({
            title, timeDuration, description, videoUrl: uploadDetails.secure_url
        })

        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $push: {
                    SubSection: subSectionDetails._id
                }
            },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: "Subsection Created Successfully",
            Section: updatedSection
        })
    }
    catch (error) {
        return res.status(200).json({
            success: false,
            message: "An Error Occurred While Creating Subsection",
            error: error.message
        })
    }
}