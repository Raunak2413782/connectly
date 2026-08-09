const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
    sendMessage,
    getMessages
} = require("../controllers/messageController");

router.post("/messages", auth, sendMessage);

router.get("/messages/:userId", auth, getMessages);

module.exports = router;