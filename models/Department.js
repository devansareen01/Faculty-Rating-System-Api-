const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
    facultyList: [{
        department: {
            type: String,
            required: true
        },
        faculties: [{
            type: mongoose.Schema.Types.ObjectId,  // Reference to Faculty model
            ref: "Faculty",  // Faculty model reference
            required: true
        }]
    }]
});

module.exports = mongoose.model("Department", DepartmentSchema);
