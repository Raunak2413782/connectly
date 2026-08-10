const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const {
    register,
    login
} = require("../controllers/authController");

const validate = require("../middleware/validate");


// =========================
// REGISTER
// =========================

router.post(
    "/register",

    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required"),

        body("email")
            .trim()
            .isEmail()
            .withMessage("Please enter a valid email"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),

        body("dob")
            .notEmpty()
            .withMessage("Date of birth is required")
    ],

    validate,

    register
);


// =========================
// LOGIN
// =========================

router.post(
    "/login",

    [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Please enter a valid email"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],

    validate,

    login
);


module.exports = router;