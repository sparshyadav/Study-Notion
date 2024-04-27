const Section = require("../models/Section");

exports.createSection = async (req, res) => {
    try {
        const { sectionName, courseId } = req.body;

        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing Properties"
            })
        }

        const newSection = await Section.create({ sectionName });

        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
            {
                $push: {
                    courseContent: newSection._id
                }
            },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: "Section Created Successfully",
            course: updatedCourseDetails
        })
    }
    catch (error) {
        console.log("An Error Occurred While Creating a New Section");

        return res.status(500).json({
            success: false,
            message: "Unable To Create new Section",
            error: error.message
        })
    }
}

exports.updateSection = async (req, res) => {
    try {
        const { sectionName, sectionId } = req.body;

        if (!sectionId || !sectionName) {
            return res.status(400).json({
                success: false,
                message: "Missing Properties"
            })
        }

        const section = await Section.findByIdAndUpdate(sectionId,
            { sectionName },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: "Section Updated Successfully",
            data: section
        })
    }
    catch (error) {
        return res.status(500).json({
            message: "Unable to Update Section",
            error: error.message
        })
    }
}

exports.deleteSection = async (req, res) => {
    try {
        const { sectionId } = req.body;

        await Section.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success: true,
            message: "Section Deleted Successfully"
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to Delete Section",
            error: error.message
        })
    }
}

