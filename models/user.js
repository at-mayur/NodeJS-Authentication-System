const mongoose = require("mongoose");

// User schema for authentication
const userSchema = new mongoose.Schema({

    user_name: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true,
        unique: true
    },
    user_password: {
        type: String,
        required: true
    },
    social_login: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });


const user = mongoose.model("User", userSchema);

module.exports = user;