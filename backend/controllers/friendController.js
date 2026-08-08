const FriendRequest = require("../models/FriendRequest");
const Friend = require("../models/Friend");

exports.sendFriendRequest = async (req, res) => {

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

};


exports.getFriendRequests = async (req, res) => {

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

};


exports.acceptFriendRequest = async (req, res) => {

    try {

        const request = await FriendRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).send("Request not found");
        }

        if (request.receiver.toString() !== req.user.id) {
            return res.status(403).send("Unauthorized");
        }

        // Check if friendship already exists
        const existingFriend = await Friend.findOne({
            $or: [
                {
                    user1: request.sender,
                    user2: request.receiver
                },
                {
                    user1: request.receiver,
                    user2: request.sender
                }
            ]
        });

        if (existingFriend) {
            return res.status(400).send("Users are already friends");
        }

        // Create friendship
        const friend = new Friend({
            user1: request.sender,
            user2: request.receiver
        });

        await friend.save();

        // Update request status
        request.status = "accepted";

        await request.save();

        res.send("Friend request accepted");

    } catch (error) {

        console.log(error);
        res.status(500).send("Server Error");

    }

};


exports.rejectFriendRequest = async (req, res) => {

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

};

exports.getFriends = async (req, res) => {

    try {

        const friends = await Friend.find({
            $or: [
                { user1: req.user.id },
                { user2: req.user.id }
            ]
        })
        .populate("user1", "name email")
        .populate("user2", "name email");

        const friendList = friends.map((friend) => {

            if (friend.user1._id.toString() === req.user.id) {
                return friend.user2;
            }

            return friend.user1;

        });

        res.json(friendList);

    } catch (error) {

        console.log(error);

        res.status(500).send("Server Error");

    }

};