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
const messageRoutes = require("./routes/messageRoutes");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const Friend = require("./models/Friend");

app.use(cors());
app.use(express.json());
connectDB();
app.use(authRoutes);
app.use(userRoutes);
app.use(friendRoutes);
app.use(messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {

    const userId = socket.handshake.auth.userId;

    socket.userId = userId;

    // User apne ID wale room me join karega
    socket.join(userId);

    console.log("🟢 User connected:", userId, socket.id);

    socket.on("send_message", async (data) => {

        try {

            const { receiverId, text } = data;

            if (!receiverId || !text || text.trim() === "") {
                return;
            }

            // Check friendship
            const friendship = await Friend.findOne({
                $or: [
                    {
                        user1: socket.userId,
                        user2: receiverId
                    },
                    {
                        user1: receiverId,
                        user2: socket.userId
                    }
                ]
            });

            if (!friendship) {
                socket.emit("message_error", {
                    message: "You can only message your friends"
                });

                return;
            }

            // Save message in MongoDB
            const message = new Message({
                sender: socket.userId,
                receiver: receiverId,
                text: text.trim()
            });

            const savedMessage = await message.save();

            // Send message to sender + receiver
            io.to(socket.userId)
            .to(receiverId)
            .emit("receive_message", savedMessage);

        } catch (error) {

            console.log("Socket message error:", error);

            socket.emit("message_error", {
                message: "Message could not be sent"
            });

        }

    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", userId);
    });

});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});