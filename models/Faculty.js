const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const FacultySchema = new mongoose.Schema({
    facultyId: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        max: 15
    },
    department: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4
    },
    allCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    token: {
        type: String,

    }
});

FacultySchema.methods.generateAuthToken = async function () {
    try {
        // Create the token payload including the faculty's _id and name
        let token = jwt.sign(
            { _id: this._id, name: this.name }, // adding the faculty name to the token payload
            process.env.SECRET_KEY
        );

        this.token = token;
        await this.save();  // save the token to the database

        return token;
    } catch (error) {
        return error;
    }
};

module.exports = mongoose.model("Faculty", FacultySchema);