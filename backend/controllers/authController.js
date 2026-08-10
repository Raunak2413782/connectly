const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// =========================
// REGISTER
// =========================

exports.register = async (req, res) => {

    const { name, email, password, dob } = req.body;

    try {

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            dob
        });

        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User Registered Successfully"
        });

    } catch (err) {

        console.log("Register error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });

    }

};


// =========================
// LOGIN
// =========================

exports.login = async (req, res) => {

    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {

        console.log("Login error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });

    }

};