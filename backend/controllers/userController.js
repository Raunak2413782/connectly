const User = require("../models/User");

exports.getProfile = async (req, res) => {

    const user = await User.findById(req.user.id).select("-password");

    res.json(user);

};

exports.searchUsers = async (req, res) => {

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

};