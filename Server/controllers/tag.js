const Tag = require("../models/Tags");

exports.createTag = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All Fields are Required"
            })
        }

        const tagDetails = await Tag.create({
            name: name,
            description: description
        })
        console.log(tagDetails);

        return res.status(200).json({
            success: true,
            message: "Tag Created Successfully"
        })
    }
    catch (error) {
        console.log("An Error Occurred While Creating a New Tag")
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.showAllTags = async (req, res) => {
    try {
        let allTags = await Tag.find({}, { name: true, description: true });

        res.status(200).json({
            success: true,
            message: "All Tags Returned Successfully",
            tags: allTags
        })
    }
    catch (error) {
        console.log("An Error Occurred While Extracting All Tags");
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}