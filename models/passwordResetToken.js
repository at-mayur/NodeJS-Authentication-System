const mongoose = require("mongoose");

// Password Token schema for forgot password token
const passwordTokenSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    // field with TTL index. 
    expiresAt: {
        type: Date,
        default: Date.now(),
        // it will remove entire document after mentioned seconds.
        expires: 5*60
    }

}, { timestamps: true });


// create model from schema
const passwordToken = mongoose.model("PasswordToken", passwordTokenSchema);

module.exports = passwordToken;