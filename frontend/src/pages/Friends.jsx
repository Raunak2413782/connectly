import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

function Friends() {

    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const socket = useSocket();


    // =========================
    // FETCH FRIENDS
    // =========================

    useEffect(() => {

        async function fetchFriends() {

            try {

                const token = localStorage.getItem("token");

                const response = await API.get("/friends", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = response.data;

                setFriends(
                    Array.isArray(data)
                        ? data
                        : data.friends || []
                );

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        }

        fetchFriends();

    }, []);

    // =========================
// REAL-TIME ONLINE STATUS
// =========================

useEffect(() => {

    if (!socket?.current) {
        return;
    }

    const handleUserStatus = (data) => {

        console.log("👤 User status changed:", data);

        setFriends((prevFriends) => {

            return prevFriends.map((friend) => {

                if (friend._id === data.userId) {

                    return {
                        ...friend,
                        isOnline: data.isOnline,
                        lastSeen: data.lastSeen
                    };

                }

                return friend;

            });

        });

    };

    socket.current.on(
        "user_status",
        handleUserStatus
    );

    return () => {

        socket.current?.off(
            "user_status",
            handleUserStatus
        );

    };

}, [socket]);

// =========================
// REAL-TIME LAST MESSAGE + UNREAD COUNT
// =========================

useEffect(() => {

    if (!socket?.current) {
        return;
    }

    const currentUserId = localStorage.getItem("userId");


    const handleReceiveMessage = (message) => {

        console.log("📩 Friend page received message:", message);


        // Only process messages received by current user
        if (
            message.receiver?.toString() !==
            currentUserId?.toString()
        ) {
            return;
        }


        setFriends((prevFriends) => {

            return prevFriends.map((friend) => {

                // Message is from this friend
                if (
                    friend._id.toString() ===
                    message.sender?.toString()
                ) {

                    return {

                        ...friend,

                        // Update last message immediately
                        lastMessage: {

                            text: message.isDeleted
                                ? "This message was deleted"
                                : message.text,

                            createdAt: message.createdAt,

                            sender: message.sender,

                            isDeleted:
                                message.isDeleted || false

                        },

                        // Increase unread count
                        unreadCount:
                            (friend.unreadCount || 0) + 1

                    };

                }

                return friend;

            });

        });

    };

    const handleMessagesRead = (data) => {

        console.log("✓✓ Messages read:", data);

        const readerId = data.readerId;

        setFriends((prevFriends) => {

            return prevFriends.map((friend) => {

                if (
                    friend._id.toString() ===
                    readerId?.toString()
                ) {

                    return {
                        ...friend,
                        unreadCount: 0
                    };

                }

                return friend;

            });

        });

    };


    socket.current.on(
        "receive_message",
        handleReceiveMessage
    );

    socket.current.on(
        "messages_read",
        handleMessagesRead
    );


    return () => {

        socket.current?.off(
            "receive_message",
            handleReceiveMessage
        );

        socket.current?.off(
            "messages_read",
            handleMessagesRead
        );

    };

}, [socket]);


    // =========================
    // LAST SEEN FORMAT
    // =========================

    function formatLastSeen(lastSeen) {

        if (!lastSeen) {
            return "Offline";
        }

        const date = new Date(lastSeen);

        const now = new Date();

        const diff = Math.floor(
            (now - date) / 1000
        );


        if (diff < 60) {
            return "Last seen just now";
        }


        const minutes = Math.floor(diff / 60);

        if (minutes < 60) {
            return `Last seen ${minutes} ${
                minutes === 1 ? "minute" : "minutes"
            } ago`;
        }


        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `Last seen ${hours} ${
                hours === 1 ? "hour" : "hours"
            } ago`;
        }


        const days = Math.floor(hours / 24);

        return `Last seen ${days} ${
            days === 1 ? "day" : "days"
        } ago`;

    }


    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex justify-center items-start pt-16 px-4">

            <div className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700">


                <h1 className="text-4xl font-bold text-green-400 text-center">
                    My Friends
                </h1>


                <p className="text-center text-gray-400 mt-2 mb-8">
                    People you're connected with
                </p>


                {loading ? (

                    <p className="text-center text-gray-400">
                        Loading friends...
                    </p>

                ) : friends.length === 0 ? (

                    <p className="text-center text-gray-400">
                        You don't have any friends yet.
                    </p>

                ) : (

                    <div className="space-y-4">

                        {friends.map((friend) => (

                            <div
                                key={friend._id}
                                className="bg-slate-700 rounded-xl p-5 flex justify-between items-center gap-4"
                            >


                                {/* USER INFO */}

                                <div className="flex items-center gap-4">


                                    {/* PROFILE CIRCLE */}

                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">

                                        {friend.name
                                            ?.charAt(0)
                                            .toUpperCase()}

                                    </div>


                                    {/* NAME + LAST MESSAGE + STATUS */}

                                    <div className="min-w-0">

                                        <div className="flex items-center gap-2">

                                            <h2 className="text-white font-semibold text-lg">
                                                {friend.name}
                                            </h2>

                                            {friend.unreadCount > 0 && (
                                                <span className="bg-green-500 text-white text-xs font-bold min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
                                                    {friend.unreadCount > 99
                                                        ? "99+"
                                                        : friend.unreadCount}
                                                </span>
                                            )}

                                        </div>


                                        {/* LAST MESSAGE */}

                                        <p className="text-gray-400 text-sm truncate max-w-[280px]">

                                            {friend.lastMessage
                                                ? friend.lastMessage.text
                                                : "No messages yet"}

                                        </p>


                                        {/* ONLINE STATUS */}

                                        {friend.isOnline ? (

                                            <p className="text-green-400 text-sm mt-1">
                                                🟢 Online
                                            </p>

                                        ) : (

                                            <p className="text-gray-500 text-sm mt-1">
                                                ⚫ {formatLastSeen(friend.lastSeen)}
                                            </p>

                                        )}

                                    </div>

                                </div>


                                {/* MESSAGE BUTTON */}

                                <button
                                    onClick={() =>
                                        navigate(`/chat/${friend._id}`)
                                    }
                                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition"
                                >
                                    Message
                                </button>


                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>

    );

}

export default Friends;