const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    dob: Date,

    // Online / Offline status
    isOnline: {
        type: Boolean,
        default: false
    },

    // Last time user was online
    lastSeen: {
        type: Date,
        default: null
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;