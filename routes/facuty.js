// routes/adminRoutes.js

const express = require('express');

const router = express.Router();
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const XLSX = require('xlsx');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const upload = multer();
const deleteToken = async (req, res, next) => {
    try {

        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        if (!token) {
            throw new Error('Authentication required');
        }

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

        const faculty = Faculty.findById({ _id: verifyUser._id });

        if (faculty) {
            await faculty.updateOne({ $set: { token: null } }).exec();
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

        if (!token) {
            throw new Error('Authentication required');
        }

        console.log(token);
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

        const faculty = await Faculty.findById({ _id: verifyUser._id });

        if (faculty) {
            next();
        } else {
            return res.status(401).json({ message: "Authorization required" })
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



// Faculty Login
router.post('/login', async (req, res) => {
    try {
        // console.log("hi")
        const faculty = await Faculty.findOne({ facultyId: req.body.facultyId });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty memeber is not registered" })
        }

        if (req.body.password == faculty.password) {
            const token = await faculty.generateAuthToken();
            console.log("hi")
            console.log(token)
            return res.status(200).json({
                message: 'Login Sucessfull',
                token: token,
                name: faculty.name
            });
        } else {
            return res.status(404).json({ message: "wrong password" })
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

    // console.log(req.session);

});

router.post('/logout', deleteToken, async (req, res) => {
    try {

        return res.status(200).json({ message: "User is logged out successfully" })

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

router.post('/student-register', authorization, async (req, res) => {
    try {
        const newStudent = new Student({
            studentId: req.body.studentId,
            email: req.body.email,
            name: req.body.name,
            branch: req.body.branch,
            semester: req.body.semester,
            password: req.body.password,
            incharge_id: req.body.incharge_id

        })


        const token = await newStudent.generateAuthToken();
        await newStudent.save();
        return res.status(200).json({
            message: "Student registered successfully",
            newStudent: newStudent
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


router.post('/import-students', authorization, upload.single('file'), async (req, res) => {
    try {
        // Access the uploaded file from req.file
        const file = req.file;

        // Process the file (example: convert to JSON)
        const workBook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workBook.SheetNames[0];
        const workSheet = workBook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });

        // Skip the first row (headers)
        const dataToInsert = jsonData.slice(1).map((row) => {
            return {
                studentId: row[0],
                name: row[1],
                email: row[2],
                branch: row[3],
                semester: row[4],
                password: row[5],
                incharge_id: row[6]

            };
        });

        await Student.insertMany(dataToInsert);
        return res.status(200).json({ message: "Student added sucessfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.post('/getStudents', authorization, async (req, res) => {
    try {

        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error('Authentication required');
        }

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const faculty = await Faculty.findById({ _id: verifyUser._id });


        if (!faculty) {
            return res.status(204).json({ message: "Faculty not registered" });
        } else {
            const allStudent = await Student.find({ incharge_id: faculty.facultyId })
            return res.status(200).json(allStudent);

        }
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
        const faculty = await Faculty.findById({ _id: verifyUser._id });



        if (oldPassword !== faculty.password) {
            return res.status(401).json({ message: "Incorrect old password" });
        }
        //s

        faculty.password = newPassword;
        await faculty.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.delete('/delete_student', authorization, async (req, res) => {
    try {

        const { studentId } = req.body;
        await Student.deleteOne({ studentId: studentId }); // Correct syntax for deleteOne
        return res.status(200).json({ message: 'Student deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting Student' });
    }
});

router.put('/update_student', authorization, async (req, res) => {
    try {
        const { studentId, name, email, branch, semester } = req.body;
        const updatedFields = {};

        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;
        if (branch) updatedFields.branch = branch;
        if (semester) updatedFields.semester = semester;

        const updatedStudent = await Student.findOneAndUpdate(
            { studentId: studentId }, // Find student by ID
            { $set: updatedFields },  // Update the fields dynamically
            { new: true }             // Return the updated document
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.status(200).json({ message: 'Student updated successfully', updatedStudent });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating student' });
    }
});
module.exports = router;