require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");
const FriendRequest = require("./models/FriendRequest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");

app.use(cors());
app.use(express.json());
connectDB();
app.use(authRoutes);
app.use(userRoutes);
app.use(friendRoutes);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});