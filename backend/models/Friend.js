const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// =========================
// DATABASE INDEXES
// =========================

friendSchema.index({
    user1: 1
});

friendSchema.index({
    user2: 1
});

const Friend = mongoose.model("Friend", friendSchema);

module.exports = Friend;