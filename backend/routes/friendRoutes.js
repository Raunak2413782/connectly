const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends
} = require("../controllers/friendController");


router.post("/friend-request", auth, sendFriendRequest);

router.get("/friend-requests", auth, getFriendRequests);

router.put("/friend-request/:id/accept", auth, acceptFriendRequest);

router.put("/friend-request/:id/reject", auth, rejectFriendRequest);

router.get("/friends", auth, getFriends);


module.exports = router;