const Message = require("../models/Message");
const Friend = require("../models/Friend");
const User = require("../models/User");


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