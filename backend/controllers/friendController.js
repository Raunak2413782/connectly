const FriendRequest = require("../models/FriendRequest");
const Friend = require("../models/Friend");
const User = require("../models/User");


// =========================
// SEND FRIEND REQUEST
// =========================

exports.sendFriendRequest = async (req, res) => {

    try {

        const { receiverId } = req.body;

        // Check if receiver exists
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // User cannot send request to himself
        if (receiverId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a request to yourself"
            });
        }

        // Check if already friends
        const existingFriend = await Friend.findOne({
            $or: [
                {
                    user1: req.user.id,
                    user2: receiverId
                },
                {
                    user1: receiverId,
                    user2: req.user.id
                }
            ]
        });

        if (existingFriend) {
            return res.status(400).json({
                success: false,
                message: "Users are already friends"
            });
        }

        // Check pending request in either direction
        const existingRequest = await FriendRequest.findOne({
            $or: [
                {
                    sender: req.user.id,
                    receiver: receiverId,
                    status: "pending"
                },
                {
                    sender: receiverId,
                    receiver: req.user.id,
                    status: "pending"
                }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "Friend request already exists"
            });
        }

        // Create friend request
        const friendRequest = new FriendRequest({
            sender: req.user.id,
            receiver: receiverId
        });

        await friendRequest.save();

        return res.status(201).json({
            success: true,
            message: "Friend request sent"
        });

    } catch (error) {

        console.log("Send friend request error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


// =========================
// GET FRIEND REQUESTS
// =========================

exports.getFriendRequests = async (req, res) => {

    try {

        const requests = await FriendRequest.find({
            receiver: req.user.id,
            status: "pending"
        })
        .populate("sender", "name email");

        return res.status(200).json({
            success: true,
            requests
        });

    } catch (error) {

        console.log("Get friend requests error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


// =========================
// ACCEPT FRIEND REQUEST
// =========================

exports.acceptFriendRequest = async (req, res) => {

    try {

        const request = await FriendRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        // Only receiver can accept
        if (request.receiver.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Request must be pending
        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Friend request is no longer pending"
            });
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
            return res.status(400).json({
                success: false,
                message: "Users are already friends"
            });
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

        return res.status(200).json({
            success: true,
            message: "Friend request accepted"
        });

    } catch (error) {

        console.log("Accept friend request error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


// =========================
// REJECT FRIEND REQUEST
// =========================

exports.rejectFriendRequest = async (req, res) => {

    try {

        const request = await FriendRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        // Only receiver can reject
        if (request.receiver.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Request must be pending
        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Friend request is no longer pending"
            });
        }

        request.status = "rejected";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Friend request rejected"
        });

    } catch (error) {

        console.log("Reject friend request error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


// =========================
// GET FRIENDS
// =========================

exports.getFriends = async (req, res) => {

    try {

        const friends = await Friend.find({
            $or: [
                { user1: req.user.id },
                { user2: req.user.id }
            ]
        })
        .populate(
            "user1",
            "name email isOnline lastSeen"
        )
        .populate(
            "user2",
            "name email isOnline lastSeen"
        );


        const friendList = friends.map((friend) => {

            if (friend.user1._id.toString() === req.user.id) {

                return friend.user2;

            }

            return friend.user1;

        });


        return res.status(200).json({
            success: true,
            friends: friendList
        });


    } catch (error) {

        console.log(
            "Get friends error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};