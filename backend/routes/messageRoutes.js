const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

const {
    sendMessage,
    getMessages
} = require("../controllers/messageController");


// =========================
// SEND MESSAGE
// =========================

router.post(
    "/messages",

    auth,

    [
        body("receiverId")
            .notEmpty()
            .withMessage("Receiver ID is required")
            .isMongoId()
            .withMessage("Invalid receiver ID"),

        body("text")
            .trim()
            .notEmpty()
            .withMessage("Message text is required")
            .isLength({ max: 1000 })
            .withMessage("Message cannot exceed 1000 characters")
    ],

    validate,

    sendMessage
);


// =========================
// GET MESSAGES
// =========================

router.get(
    "/messages/:userId",

    auth,

    [
        param("userId")
            .isMongoId()
            .withMessage("Invalid user ID")
    ],

    validate,

    getMessages
);


module.exports = router;