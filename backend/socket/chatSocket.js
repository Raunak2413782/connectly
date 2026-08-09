const Message = require("../models/Message");
const Friend = require("../models/Friend");

function chatSocket(io) {

    io.on("connection", (socket) => {

        const userId = socket.userId;

        // User apne personal room me join karega
        socket.join(userId);

        console.log(
            "🟢 Authenticated user connected:",
            userId,
            socket.id
        );


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

        socket.on("disconnect", () => {

            console.log(
                "🔴 User disconnected:",
                userId
            );

        });

    });

}

module.exports = chatSocket;