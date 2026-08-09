const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

    console.log(req.body);

    const { name, email, password, dob } = req.body;

    if (email === "" || password === "") {
        return res.send("Please enter email and password");
    } else if (password.length < 6) {
        return res.send("Password must be at least 6 characters long");
    }

    try {

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).send("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            dob
        });

        await newUser.save();

        return res.send("User Registered Successfully");

    } catch (err) {

        console.log(err);
        return res.send("Something went wrong");

    }

};

exports.login = async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.send("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.send("Invalid Password");
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return res.json({
        message: "Login Successful",
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        }
    });

};