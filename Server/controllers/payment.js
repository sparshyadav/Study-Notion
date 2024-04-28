const Course = require("../models/Course");
const mongoose = require("mongoose");

exports.capturePayment = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        if (!courseId) {
            return res.json({
                success: false,
                message: "Please Provide Valid Course ID"
            })
        }

        let course;
        try {
            course = await Course.findById(courseId);
            if (!course) {
                return res.json({
                    success: false,
                    message: "Could not Find The Course"
                })
            }

            const uid = new mongoose.Types.Schema.ObjectId(userId);
            if (course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({
                    success: false,
                    message: "Student is Already Enrolled"
                })
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }

        const amount = course.price;
        const currency = "INR";

        const options = {
            amount: amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: courseId,
                userId
            }
        }

        try {
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            return res.status(200).json({
                success: true,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount
            })
        }
        catch (error) {
            res.json({
                success: false,
                message: "An Error Occurred While Initiating Payment"
            })
        }
    }
    catch (error) {
        res.json({
            success: false,
            message: "Could Not Initiate Order"
        })
    }
}
