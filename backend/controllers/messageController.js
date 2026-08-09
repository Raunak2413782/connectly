const Message = require("../models/Message");
const Friend = require("../models/Friend");

exports.sendMessage = async (req, res) => {

    try {

        const { receiverId, text } = req.body;

        if (!receiverId || !text || text.trim() === "") {
            return res.status(400).send("Receiver and message are required");
        }

        // Check whether users are friends
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
            return res.status(403).send("You can only message your friends");
        }

        const message = new Message({
            sender: req.user.id,
            receiver: receiverId,
            text: text.trim()
        });

        await message.save();

        res.status(201).json(message);

    } catch (error) {

        console.log(error);
        res.status(500).send("Server Error");

    }

};

exports.getMessages = async (req, res) => {

    try {

        const { userId } = req.params;

        // Check whether users are friends
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
            return res.status(403).send("You can only view messages with your friends");
        }

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

        res.json(messages);

    } catch (error) {

        console.log(error);
        res.status(500).send("Server Error");

    }

};