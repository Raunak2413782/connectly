const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
    getProfile,
    searchUsers
} = require("../controllers/userController");

router.get("/profile", auth, getProfile);

router.get("/users", auth, searchUsers);

module.exports = router;