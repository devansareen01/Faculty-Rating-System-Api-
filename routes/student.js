// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const Student = require('../models/Student')
const Course = require('../models/Course');
const Feedback = require('../models/Feedback');
const Facutly = require('../models/Faculty');
const jwt = require("jsonwebtoken");

const deleteToken = async (req, res, next) => {
    try {

        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        if (!token) {
            throw new Error('Authentication required');
        }

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

        const student = Student.findById({ _id: verifyUser._id });

        if (student) {
            await student.updateOne({ $set: { token: null } }).exec();
            next();
        } else {
            return res.status(401).json({ message: "Authorization required" })
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const authorization = async (req, res, next) => {
    try {

        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        console.log(token)
        // console.log(token)
        if (!token) {
            throw new Error('Authentication required');
        }

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const student = await Student.findById({ _id: verifyUser._id });

        if (student) {
            next();
        } else {
            return res.status(401).json({ message: "Authorization required" })
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

router.post('/login', async (req, res) => {
    try {

        const student = await Student.findOne({ studentId: req.body.studentId });

        if (!student) {
            return res.status(404).json({ message: "Student is not found" });
        } else {
            // console.log("hi")
            if (req.body.password == student.password) {
                const token = await student.generateAuthToken();

                return res.status(200).json({ message: "Student is logged in successfully", token: token, name: student.name });
            } else {
                return res.status(401).json({ message: "Incorrect password" });
            }
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
router.post('/logout', deleteToken, async (req, res) => {
    try {

        return res.status(200).json({ message: "Student is logged out successfully" })

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

router.get('/getCourses/', authorization, async (req, res) => {
    try {

        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        if (!token) {
            throw new Error('Authentication required');
        }

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const student = await Student.findById({ _id: verifyUser._id });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const courses = await Course.find({ semester: student.semester, branch: student.branch });
        console.log(courses);
        return res.status(200).json(courses);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
router.post('/submitFeedback/:courseId/', authorization, async (req, res) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error('Authentication required');
        }

        // Verify the user

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const student = await Student.findById({ _id: verifyUser._id });

        // Create new feedback
        const newfeed = new Feedback({
            courseId: req.params.courseId,
            ratings: req.body.ratings,
            comments: req.body.comments,
            studentId: student.studentId
        });

        // Save the feedback
        await newfeed.save();
        return res.status(200).json({
            message: "Feedback submitted successfully",
            newfeed: newfeed
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/changePassword', authorization, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        if (!token) {
            throw new Error('Authentication required');
        }

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const student = await Student.findById({ _id: verifyUser._id });



        if (oldPassword !== student.password) {
            return res.status(401).json({ message: "Incorrect old password" });
        }
        //s


        student.password = newPassword;
        await student.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.get('/courseInfo/:courseId', authorization, async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Assuming token is passed in Authorization header
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const student = await Student.findById({ _id: verifyUser._id });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if feedback already exists for the student and course
        const existingFeedback = await Feedback.findOne({
            courseId: req.params.courseId,
            studentId: student.studentId
        });

        if (existingFeedback) {
            return res.status(400).json({ message: 'Feedback already submitted for this course' });
        } else {
            // Fetch course information
            const course = await Course.findOne({ CourseId: req.params.courseId });

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            // Return the course information
            return res.status(200).json({

                course
            });
        }

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;