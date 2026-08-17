const Message = require("../models/Message");
const Friend = require("../models/Friend");
const User = require("../models/User");
const mongoose = require("mongoose");

// =========================
// SEND MESSAGE
// =========================

exports.sendMessage = async (req, res) => {

    try {

        const { receiverId, text } = req.body;

        // Check receiver exists
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        // User cannot message himself
        if (receiverId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot message yourself"
            });
        }

        // Check friendship
        const friendship = await Friend.findOne({
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

        if (!friendship) {
            return res.status(403).json({
                success: false,
                message: "You can only message your friends"
            });
        }

        // Check text
        if (!text || text.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Message text is required"
            });
        }

        // Create message
        const message = new Message({
            sender: req.user.id,
            receiver: receiverId,
            text: text.trim()
        });

        const savedMessage = await message.save();

        return res.status(201).json({
            success: true,
            message: savedMessage
        });

    } catch (error) {

        console.log("Send message error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


// =========================
// GET MESSAGES
// =========================

exports.getMessages = async (req, res) => {

    try {

        const { userId } = req.params;

        // Check user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // User cannot view conversation with himself
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation"
            });
        }

        // Check friendship
        const friendship = await Friend.findOne({
            $or: [
                {
                    user1: req.user.id,
                    user2: userId
                },
                {
                    user1: userId,
                    user2: req.user.id
                }
            ]
        });

        if (!friendship) {
            return res.status(403).json({
                success: false,
                message: "You can only view messages with your friends"
            });
        }

        // Get conversation
        const messages = await Message.find({
            $or: [
                {
                    sender: req.user.id,
                    receiver: userId
                },
                {
                    sender: userId,
                    receiver: req.user.id
                }
            ]
        })
        .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {

        console.log("Get messages error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


// =========================
// MARK MESSAGES AS READ
// =========================

exports.markMessagesRead = async (req, res) => {

    try {

        const { userId } = req.params;

        // Check user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Cannot mark own messages as read
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation"
            });
        }

        // Check friendship
        const friendship = await Friend.findOne({
            $or: [
                {
                    user1: req.user.id,
                    user2: userId
                },
                {
                    user1: userId,
                    user2: req.user.id
                }
            ]
        });

        if (!friendship) {
            return res.status(403).json({
                success: false,
                message: "You can only read messages from your friends"
            });
        }

        // Mark only messages received from this friend as read
        const result = await Message.updateMany(
            {
                sender: userId,
                receiver: req.user.id,
                isRead: false
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Messages marked as read",
            modifiedCount: result.modifiedCount
        });

    } catch (error) {

        console.log("Mark messages read error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


// =========================
// GET UNREAD MESSAGE COUNT
// =========================

exports.getUnreadCount = async (req, res) => {

    try {

        const count = await Message.countDocuments({
            receiver: req.user.id,
            isRead: false
        });

        return res.status(200).json({
            success: true,
            unreadCount: count
        });

    } catch (error) {

        console.log("Get unread count error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// =========================
// GET RECENT CHATS
// =========================

exports.getRecentChats = async (req, res) => {

    try {

        // Get all friendships
        const friendships = await Friend.find({
            $or: [
                { user1: req.user.id },
                { user2: req.user.id }
            ]
        }).lean();

        // Get friend IDs
        const friendIds = friendships.map((friendship) => {

            return friendship.user1.toString() === req.user.id
                ? friendship.user2
                : friendship.user1;

        });

        if (friendIds.length === 0) {

            return res.status(200).json({
                success: true,
                chats: []
            });

        }

        // Get all friends in ONE query
        const friends = await User.find({
            _id: { $in: friendIds }
        })
        .select("name email isOnline lastSeen")
        .lean();


        // Get all messages in ONE query
        const messages = await Message.find({
            $or: [
                {
                    sender: req.user.id,
                    receiver: { $in: friendIds }
                },
                {
                    sender: { $in: friendIds },
                    receiver: req.user.id
                }
            ]
        })
        .select(
            "sender receiver text createdAt isDeleted isRead"
        )
        .sort({ createdAt: -1 })
        .lean();


        // Build chats
        const chats = friends.map((friend) => {

            const friendId = friend._id.toString();


            // Latest message with this friend
            const lastMessage = messages.find((message) => {

                return (
                    (
                        message.sender.toString() === req.user.id &&
                        message.receiver.toString() === friendId
                    ) ||
                    (
                        message.sender.toString() === friendId &&
                        message.receiver.toString() === req.user.id
                    )
                );

            });


            // Unread messages from this friend
            const unreadCount = messages.filter((message) => {

                return (
                    message.sender.toString() === friendId &&
                    message.receiver.toString() === req.user.id &&
                    message.isRead === false
                );

            }).length;


            return {

                friend,

                lastMessage,

                unreadCount

            };

        });


        // Only show users with at least one message
        const recentChats = chats.filter((chat) => {

            return chat.lastMessage !== null;

        });


        // Latest chats first
        recentChats.sort((a, b) => {

            const dateA =
                new Date(a.lastMessage.createdAt).getTime();

            const dateB =
                new Date(b.lastMessage.createdAt).getTime();

            return dateB - dateA;

        });


        return res.status(200).json({

            success: true,

            chats: recentChats

        });


    } catch (error) {

        console.log(
            "Get recent chats error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};