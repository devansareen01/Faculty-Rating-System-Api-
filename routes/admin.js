// routes/adminRoutes.js
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Faculty = require('../models/Faculty');
const Feedback = require('../models/Feedback');
const Course = require('../models/Course');
const XLSX = require('xlsx');

const multer = require('multer');
const upload = multer();
const deleteToken = async (req, res, next) => {
    try {

        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        if (!token) {
            throw new Error('Authentication required');
        }

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

        const admin = Admin.findById({ _id: verifyUser._id });

        if (admin) {
            await admin.updateOne({ $set: { token: null } }).exec();
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

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const admin = await Admin.findById({ _id: verifyUser._id });

        if (admin) {
            next();
        } else {
            return res.status(401).json({ message: "Authorization required" })
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};




router.post('/import-faculty', authorization, upload.single('file'), async (req, res) => {
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
                facultyId: row[0],
                email: row[1],
                name: row[2],
                department: row[3],
                password: row[4],
            };
        });

        await Faculty.insertMany(dataToInsert);
        return res.status(200).json({ message: "Faculties added sucessfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const admin = new Admin({
            adminId: 'admin123',
            email: 'admin@gmail.com',
            name: 'adminA'
        })
        await admin.generateAuthToken();
        await admin.save();
        return res.json("admin registered")

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});


// Admin Login
router.post('/login', async (req, res) => {
    try {
        const admin = await Admin.findOne({ adminId: req.body.adminId })

        if (admin) {
            const token = await admin.generateAuthToken();

            return res.status(200).json({
                message: 'Login Sucessfull',
                token: token
            });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: error.message });
    }

});



// admin logout
router.post('/logout', deleteToken, async (req, res) => {
    try {

        return res.status(200).json({ message: "User is logged out successfully" })
    } catch (error) {
        return res.status(500).josn({ message: { error } });
    }
})



router.post('/register-faculty', authorization, async (req, res) => {
    try {
        const newFaculty = new Faculty({
            facultyId: req.body.facultyId,
            name: req.body.name,
            email: req.body.email,
            department: req.body.department,
            password: req.body.password,
            branch: req.body.branch,
            semester: req.body.semester
        })
        const token = await newFaculty.generateAuthToken();
        await newFaculty.save();
        return res.status(200).json({
            message: "Faculty Registered SucessFully",
            newFaculty: newFaculty
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})


router.post('/get-faculty', authorization, async (req, res) => {
    try {
        const department = req.body.department;

        // Await the result of the query
        const allFaculties = await Faculty.find({ department: department }).populate('allCourses');

        return res.status(200).json(allFaculties);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/addCourse', authorization, async (req, res) => {
    try {
        const newCourse = new Course(req.body);

        await newCourse.save();

        const faculty = await Faculty.findOne({ facultyId: req.body.facultyId });

        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }
        faculty.allCourses.push(newCourse._id);
        await faculty.save();

        return res.status(200).json({
            message: "Course Added successfully",
            newCourse: newCourse
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/faculty/courses-and-feedbacks', authorization, async (req, res) => {
    try {



        const faculty = await Faculty.findOne({ facultyId: req.body.facultyId }).populate('allCourses')

        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }


        const courses = faculty.allCourses;


        const coursesWithFeedbacks = await Promise.all(courses.map(async (course) => {
            const feedbacks = await Feedback.find({ courseId: course.CourseId });
            return { course, feedbacks };
        }));

        return res.status(200).json(coursesWithFeedbacks);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});




router.get('/faculty/:facultyId/course/:courseId/average-ratings', authorization, async (req, res) => {
    try {
        const { facultyId, courseId } = req.params;

        // Find the faculty and populate the courses
        const faculty = await Faculty.findOne({ facultyId }).populate('allCourses');

        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Find the specific course from the faculty's courses
        const course = faculty.allCourses.find(course => String(course.CourseId) === courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found for the given faculty" });
        }

        // Fetch feedback for the specific course
        const feedbacks = await Feedback.find({ courseId });

        if (feedbacks.length === 0) {
            return res.status(200).json({
                facultyId,
                courseId,
                courseDetails: course,
                questionwiseAverageRatings: {},
                comments: []
            });
        }

        const questionwiseAverageRatings = {};
        const comments = [];

        // Iterate over each feedback
        for (const feedback of feedbacks) {
            const questionKeys = Object.keys(feedback.ratings);

            // Collect comments
            if (feedback.comments) {
                comments.push(feedback.comments);
            }

            // Iterate over each question in the feedback
            for (const questionKey of questionKeys) {
                const rating = feedback.ratings[questionKey];

                // Initialize the question in the questionwiseAverageRatings object if not exists
                if (!questionwiseAverageRatings[questionKey]) {
                    questionwiseAverageRatings[questionKey] = { totalRating: 0, count: 0 };
                }

                // Update the totalRating and count for the question
                questionwiseAverageRatings[questionKey].totalRating += rating;
                questionwiseAverageRatings[questionKey].count++;
            }
        }

        // Calculate the average rating for each question
        const result = {};
        const questionKeys = Object.keys(questionwiseAverageRatings);
        for (const questionKey of questionKeys) {
            const averageRating = questionwiseAverageRatings[questionKey].count > 0 ?
                questionwiseAverageRatings[questionKey].totalRating / questionwiseAverageRatings[questionKey].count :
                0;
            result[questionKey] = averageRating;
        }

        // Send the response with course details and feedback analysis
        return res.status(200).json({
            facultyId,
            courseId,
            courseDetails: course,
            questionwiseAverageRatings: result,
            comments
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});





// Delete faculty by ID
router.delete('/delete_faculty', authorization, async (req, res) => {
    try {
        console.log("hey");
        const { facultyId } = req.body; // Get facultyId from the request body
        console.log(req.body.facultyId);
        await Faculty.deleteOne({ facultyId: facultyId }); // Correct syntax for deleteOne
        return res.status(200).json({ message: 'Faculty deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting faculty' });
    }
});


router.get('/get_all_faculty', authorization, async (req, res) => {
    try {
        // const allFaculty = await Faculty.find().select('-allCourses');
        const allFaculty = await Faculty.find().populate('allCourses')
        return res.status(200).json(allFaculty);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});





router.post('/get-courses', authorization, async (req, res) => {
    try {
        const { department } = req.body;  // Extract department from the request body

        // Fetch courses related to the specified department
        const courses = await Course.find({ department });  // Assuming you're using a database like MongoDB
        // console.log(courses);
        if (!courses) {
            return res.status(404).json({ message: 'No courses found for this department.' });
        }

        return res.status(200).json(courses);  // Return the filtered list of courses
    } catch (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).json({ message: 'Failed to fetch courses', error });
    }
});

router.delete('/delete-course', authorization, async (req, res) => {
    try {
        const { courseId } = req.body;

        // Validate if courseId is provided
        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        // Find and delete the course by its ID
        const deletedCourse = await Course.findOneAndDelete(courseId);

        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        return res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update-faculty', authorization, async (req, res) => {
    try {
        const { name, email, department, facultyId } = req.body;
        const updatedFields = {};

        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;
        if (department) updatedFields.department = department;


        const updatedStudent = await Faculty.findOneAndUpdate(
            { facultyId: facultyId }, // Find student by ID
            { $set: updatedFields },  // Update the fields dynamically
            { new: true }             // Return the updated document
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        return res.status(200).json({ message: 'Faculty updated successfully', updatedStudent });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating Faculty' });
    }
});


router.post('/import-courses', authorization, upload.single('file'), async (req, res) => {
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
                CourseId: row[0],
                CourseName: row[1],
                facultyId: row[2],
                department: row[3],
                branch: row[4],
                semester: row[5]
            };
        });

        // Insert the courses into the database
        const insertedCourses = await Course.insertMany(dataToInsert);

        // For each inserted course, find the corresponding faculty and update their allCourses array
        for (const course of insertedCourses) {
            const faculty = await Faculty.findOne({ facultyId: course.facultyId });

            if (faculty) {
                // Push the new course's _id into the faculty's allCourses array
                faculty.allCourses.push(course._id);
                await faculty.save(); // Save the updated faculty document
            }
        }

        return res.status(200).json({ message: "Courses added successfully and faculty updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.put('/update-course', authorization, async (req, res) => {
    try {
        const { courseId, facultyId } = req.body;

        // Check if both courseId and newFacultyId are provided
        if (!courseId || !facultyId) {
            return res.status(400).json({ message: "CourseId and newFacultyId are required" });
        }

        // Find the course by CourseId and update the facultyId
        const updatedCourse = await Course.findOneAndUpdate(
            { CourseId: courseId }, // Find the course by CourseId
            { facultyId: facultyId }, // Update facultyId
            { new: true } // Return the updated document
        );

        // If no course was found
        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Successfully updated
        return res.status(200).json({
            message: "Course updated successfully",
            updatedCourse
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/faculties', authorization, async (req, res) => {
    try {
        // Fetch all faculty members from the database
        const faculties = await Faculty.find();
        console.log(faculties);
        // Check if there are no faculties found
        if (faculties.length === 0) {
            return res.status(404).json({ message: 'No faculty members found' });
        }

        // Return the list of faculty members
        return res.status(200).json(faculties);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
});


router.get('/ratings/:facultyId', authorization, async (req, res) => {
    const { facultyId } = req.params;

    try {
        // Fetch all courses for the given facultyId
        const courses = await Course.find({ facultyId: facultyId });
        // console.log(courses);
        if (courses.length === 0) {
            return res.status(404).json({ message: 'No courses found for this faculty' });
        }

        // Extract all course IDs
        const courseIds = courses.map(course => course.CourseId);

        // Fetch feedback for the courses
        const feedback = await Feedback.find({ courseId: { $in: courseIds } });

        if (feedback.length === 0) {
            return res.status(404).json({ message: 'No feedback found for these courses' });
        }

        // Process feedback data if needed
        const processedFeedback = feedback.map(fb => ({
            courseId: fb.courseId,
            studentId: fb.studentId,
            ratings: fb.ratings,
            comments: fb.comments
        }));
        // console.log(processedFeedback);
        return res.status(200).json({ feedback: processedFeedback });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
module.exports = router;