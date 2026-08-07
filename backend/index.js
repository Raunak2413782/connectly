require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const FriendRequest = require("./models/FriendRequest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

app.use(express.json());
app.use(cors());


async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.log("❌ Error Name:", err.name);
        console.log("❌ Error Message:", err.message);
    }
}

connectDB();

app.post("/register", async (req, res) => {
    console.log(req.body);
    const { name, email, password, dob } = req.body;

    if(email==="" || password===""){
        return res.send("Please enter email and password");
    }else if(password.length<6){
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
        password:hashedPassword,
        dob
        });

        await newUser.save();
        return res.send("User Registered Successfully");
    }
    catch(err) {
        console.log(err);
        return res.send("Something went wrong");
    }
});

app.post("/login", async (req, res) => {
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
        token
    });

});

app.get("/profile", auth, async (req, res) => {

    const user = await User.findById(req.user.id).select("-password");

    res.json(user);

});

app.get("/users", auth, async (req, res) => {
    try {

        const search = req.query.search || "";

        const users = await User.find({
            name: { $regex: search, $options: "i" },
            _id: { $ne: req.user.id }
        }).select("-password");

        res.json(users);

    } catch (error) {

        console.log(error);
        res.status(500).send("Server Error");

    }

});

app.post("/friend-request", auth, async (req, res) => {

    try {

        const { receiverId } = req.body;

        // User khud ko request nahi bhej sakta
        if (receiverId === req.user.id) {
            return res.status(400).send("You cannot send a request to yourself");
        }

        // Check duplicate request
        const existingRequest = await FriendRequest.findOne({
            sender: req.user.id,
            receiver: receiverId
        });

        if (existingRequest) {
            return res.status(400).send("Friend request already sent");
        }

        const friendRequest = new FriendRequest({
            sender: req.user.id,
            receiver: receiverId
        });

        await friendRequest.save();
        res.send("Friend request sent");

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
});

app.get("/friend-requests", auth, async (req, res) => {

    try {

        const requests = await FriendRequest.find({
            receiver: req.user.id,
            status: "pending"
        }).populate("sender", "name email");

        res.json(requests);

    } catch (error) {

        console.log(error);
        res.status(500).send("Server Error");

    }

});

app.put("/friend-request/:id/accept", auth, async (req, res) => {

    try {

        const request = await FriendRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).send("Request not found");
        }

        if (request.receiver.toString() !== req.user.id) {
            return res.status(403).send("Unauthorized");
        }

        request.status = "accepted";

        await request.save();

        res.send("Friend request accepted");

    } catch (error) {

        console.log(error);
        res.status(500).send("Server Error");

    }

});

app.put("/friend-request/:id/reject", auth, async (req, res) => {

    try {

        const request = await FriendRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).send("Request not found");
        }

        if (request.receiver.toString() !== req.user.id) {
            return res.status(403).send("Unauthorized");
        }

        request.status = "rejected";

        await request.save();

        res.send("Friend request rejected");

    } catch (error) {

        console.log(error);
        res.status(500).send("Server Error");

    }

});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});