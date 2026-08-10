const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

const {
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends
} = require("../controllers/friendController");


// =========================
// SEND FRIEND REQUEST
// =========================

router.post(
    "/friend-request",

    auth,

    [
        body("receiverId")
            .notEmpty()
            .withMessage("Receiver ID is required")

            .isMongoId()
            .withMessage("Invalid receiver ID")
    ],

    validate,

    sendFriendRequest
);


// =========================
// GET FRIEND REQUESTS
// =========================

router.get(
    "/friend-requests",
    auth,
    getFriendRequests
);


// =========================
// ACCEPT FRIEND REQUEST
// =========================

router.put(
    "/friend-request/:id/accept",

    auth,

    [
        param("id")
            .isMongoId()
            .withMessage("Invalid request ID")
    ],

    validate,

    acceptFriendRequest
);


// =========================
// REJECT FRIEND REQUEST
// =========================

router.put(
    "/friend-request/:id/reject",

    auth,

    [
        param("id")
            .isMongoId()
            .withMessage("Invalid request ID")
    ],

    validate,

    rejectFriendRequest
);


// =========================
// GET FRIENDS
// =========================

router.get(
    "/friends",
    auth,
    getFriends
);


module.exports = router;