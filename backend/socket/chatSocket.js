const Message = require("../models/Message");
const Friend = require("../models/Friend");
const User = require("../models/User");

function chatSocket(io) {

    io.on("connection", async (socket) => {

        const userId = socket.userId;

        // User apne personal room me join karega
        socket.join(userId);

        console.log(
            "🟢 Authenticated user connected:",
            userId,
            socket.id
        );

        // =========================
        // USER ONLINE
        // =========================

        try {

            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastSeen: null
            });

            // Notify friends that this user is online

            const friendships = await Friend.find({
                $or: [
                    { user1: userId },
                    { user2: userId }
                ]
            });

            friendships.forEach((friendship) => {

                const friendId =
                    friendship.user1.toString() === userId.toString()
                        ? friendship.user2.toString()
                        : friendship.user1.toString();

                io.to(friendId).emit("user_status", {
                    userId: userId.toString(),
                    isOnline: true,
                    lastSeen: null
                });

            });

            console.log("🟢 User marked ONLINE:", userId);

        } catch (error) {

            console.log(
                "❌ Online status update error:",
                error
            );

        }


        // =========================
        // SEND MESSAGE
        // =========================

        socket.on("send_message", async (data) => {

            try {

                const { receiverId, text } = data;

                // Validate message
                if (!receiverId || !text || text.trim() === "") {
                    return;
                }


                // =========================
                // CHECK FRIENDSHIP
                // =========================

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


                // =========================
                // SAVE MESSAGE
                // =========================

                const message = new Message({

                    sender: socket.userId,

                    receiver: receiverId,

                    text: text.trim()

                });


                const savedMessage = await message.save();


                // =========================
                // SEND TO BOTH USERS
                // =========================

                io.to(socket.userId)
                    .to(receiverId)
                    .emit("receive_message", savedMessage);


            } catch (error) {

                console.log(
                    "❌ Socket message error:",
                    error
                );

                socket.emit("message_error", {
                    message: "Message could not be sent"
                });

            }

        });


        // =========================
        // DISCONNECT
        // =========================

        socket.on("disconnect", async () => {

            console.log(
                "🔴 User disconnected:",
                userId
            );

            try {

                /*
                 * Check if user has another socket connected.
                 *
                 * This is important because the same user can
                 * have multiple tabs/devices open.
                 */

                const userRoom = io.sockets.adapter.rooms.get(userId);

                const remainingConnections = userRoom
                    ? userRoom.size
                    : 0;

                // Only mark offline when ALL connections are gone
                if (remainingConnections === 0) {

                const lastSeen = new Date();

                await User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    lastSeen: lastSeen
                });

                console.log(
                    "🔴 User marked OFFLINE:",
                    userId
                );


                // Notify friends that this user is offline

                const friendships = await Friend.find({
                    $or: [
                        { user1: userId },
                        { user2: userId }
                    ]
                });


                friendships.forEach((friendship) => {

                    const friendId =
                        friendship.user1.toString() === userId.toString()
                            ? friendship.user2.toString()
                            : friendship.user1.toString();


                    io.to(friendId).emit("user_status", {

                        userId: userId.toString(),

                        isOnline: false,

                        lastSeen: lastSeen

                    });

                });

            }

            } catch (error) {

                console.log(
                    "❌ Offline status update error:",
                    error
                );

            }

        });

    });

}

module.exports = chatSocket;