const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const StudentSchema = new mongoose.Schema({
    studentId: {
        type: String,
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
    branch: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        min: 4
    },
    incharge_id: {
        type: Number,
        required: true
    },

    token: {
        type: String,

    },

})
StudentSchema.methods.generateAuthToken = async function () {
    try {

        let token = await jwt.sign({ _id: this._id, name: this.name }, process.env.SECRET_KEY);
        this.token = token
        await this.save();
        return token;
    } catch (error) {
        return error;
    }
};
module.exports = mongoose.model("Student", StudentSchema);