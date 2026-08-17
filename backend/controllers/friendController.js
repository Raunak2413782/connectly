const FriendRequest = require("../models/FriendRequest");
const Friend = require("../models/Friend");
const User = require("../models/User");
const Message = require("../models/Message");
const mongoose = require("mongoose");


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


        // =========================
        // REAL-TIME FRIEND REQUEST
        // =========================

        const io = req.app.get("io");

        if (io) {

            io.to(receiverId).emit("new_friend_request", {

                requestId: friendRequest._id,

                senderId: req.user.id,

                senderName: req.user.name || "Someone"

            });

        }


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

        const currentUserId =
            new mongoose.Types.ObjectId(req.user.id);


        // =========================
        // GET ALL FRIENDSHIPS
        // =========================

        const friendships = await Friend.find({
            $or: [
                { user1: req.user.id },
                { user2: req.user.id }
            ]
        })
        .select("user1 user2")
        .lean();


        // =========================
        // GET FRIEND IDS
        // =========================

        const friendIds = friendships.map((friend) => {

            return friend.user1.toString() === req.user.id
                ? friend.user2
                : friend.user1;

        });


        // =========================
        // NO FRIENDS
        // =========================

        if (friendIds.length === 0) {

            return res.status(200).json({

                success: true,

                friends: []

            });

        }


        // =========================
        // GET FRIEND USERS
        // =========================

        const friendUsers = await User.find({

            _id: {
                $in: friendIds
            }

        })
        .select(
            "name email isOnline lastSeen"
        )
        .lean();


        // =========================
        // GET MESSAGE STATS
        // =========================

        const messageStats = await Message.aggregate([

            // Only messages between current user
            // and his friends
            {
                $match: {

                    $or: [

                        {
                            sender: currentUserId,

                            receiver: {
                                $in: friendIds
                            }
                        },

                        {
                            sender: {
                                $in: friendIds
                            },

                            receiver: currentUserId
                        }

                    ]

                }
            },


            // Find which friend each message belongs to
            {
                $set: {

                    friendId: {

                        $cond: [

                            {
                                $eq: [
                                    "$sender",
                                    currentUserId
                                ]
                            },

                            "$receiver",

                            "$sender"

                        ]

                    }

                }

            },


            // Latest message first
            {
                $sort: {

                    createdAt: -1

                }

            },


            // One result per friend
            {
                $group: {

                    _id: "$friendId",


                    // Latest message
                    lastMessage: {

                        $first: {

                            _id: "$_id",

                            text: "$text",

                            sender: "$sender",

                            receiver: "$receiver",

                            createdAt: "$createdAt",

                            isDeleted: "$isDeleted"

                        }

                    },


                    // Unread messages
                    unreadCount: {

                        $sum: {

                            $cond: [

                                {
                                    $and: [

                                        // Message came FROM friend
                                        {
                                            $ne: [
                                                "$sender",
                                                currentUserId
                                            ]
                                        },

                                        // Message was received by me
                                        {
                                            $eq: [
                                                "$receiver",
                                                currentUserId
                                            ]
                                        },

                                        // Not read
                                        {
                                            $eq: [
                                                "$isRead",
                                                false
                                            ]
                                        },

                                        // Not deleted
                                        {
                                            $eq: [
                                                "$isDeleted",
                                                false
                                            ]
                                        }

                                    ]

                                },

                                1,

                                0

                            ]

                        }

                    }

                }

            }

        ]);


        // =========================
        // CREATE MESSAGE MAP
        // =========================

        const messageMap = new Map();


        messageStats.forEach((item) => {

            messageMap.set(
                item._id.toString(),
                item
            );

        });


        // =========================
        // BUILD FRIEND LIST
        // =========================

        const friendList = friendUsers.map((friendUser) => {

            const friendId =
                friendUser._id.toString();


            const stats =
                messageMap.get(friendId);


            const lastMessage =
                stats?.lastMessage;


            return {

                _id: friendUser._id,

                name: friendUser.name,

                email: friendUser.email,

                isOnline: friendUser.isOnline,

                lastSeen: friendUser.lastSeen,


                lastMessage: lastMessage
                    ? {

                        text: lastMessage.isDeleted
                            ? "This message was deleted"
                            : lastMessage.text,

                        createdAt:
                            lastMessage.createdAt,

                        sender:
                            lastMessage.sender,

                        isDeleted:
                            lastMessage.isDeleted

                    }
                    : null,


                unreadCount:
                    stats?.unreadCount || 0

            };

        });


        // =========================
        // SORT BY LAST MESSAGE
        // =========================

        friendList.sort((a, b) => {

            const dateA =
                a.lastMessage?.createdAt
                    ? new Date(
                        a.lastMessage.createdAt
                    ).getTime()
                    : 0;


            const dateB =
                b.lastMessage?.createdAt
                    ? new Date(
                        b.lastMessage.createdAt
                    ).getTime()
                    : 0;


            return dateB - dateA;

        });


        // =========================
        // RESPONSE
        // =========================

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