const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true
        },

        isDeleted: {
            type: Boolean,
            default: false
        },

        deletedAt: {
            type: Date,
            default: null
        },

        // =========================
        // READ RECEIPT
        // =========================

        isRead: {
            type: Boolean,
            default: false
        },

        readAt: {
            type: Date,
        },

        // =========================
        // DELIVERY RECEIPT
        // =========================

        isDelivered: {
            type: Boolean,
            default: false
        },

        deliveredAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// =========================
// DATABASE INDEXES
// =========================

messageSchema.index({
    sender: 1,
    receiver: 1,
    createdAt: -1
});

messageSchema.index({
    receiver: 1,
    sender: 1,
    createdAt: -1
});

messageSchema.index({
    receiver: 1,
    isRead: 1,
    sender: 1
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;