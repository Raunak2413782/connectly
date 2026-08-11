import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { useSocket } from "../context/SocketContext";

function Chat() {

    const { friendId } = useParams();
    const socket = useSocket();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [friend, setFriend] = useState(null);

    const messagesEndRef = useRef(null);

    const token = localStorage.getItem("token");


    // =========================
    // FETCH OLD MESSAGES
    // =========================

    useEffect(() => {

        async function fetchMessages() {

            try {

                const response = await API.get(
                    `/messages/${friendId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setMessages(response.data.messages);

            } catch (error) {

                console.log(
                    "❌ Fetch messages error:",
                    error
                );

            } finally {

                setLoading(false);

            }

        }

        fetchMessages();

    }, [friendId, token]);


    // =========================
    // FETCH FRIEND INFORMATION
    // =========================

    useEffect(() => {

        async function fetchFriend() {

            try {

                const response = await API.get(
                    "/friends",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = response.data;

                const friendList = Array.isArray(data)
                    ? data
                    : data.friends || [];

                const currentFriend = friendList.find(
                    (user) => user._id === friendId
                );

                setFriend(currentFriend || null);

            } catch (error) {

                console.log(
                    "❌ Friend fetch error:",
                    error
                );

            }

        }

        fetchFriend();

    }, [friendId, token]);


    // =========================
    // AUTO SCROLL
    // =========================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);


    // =========================
    // SOCKET EVENTS
    // =========================

    useEffect(() => {

        if (!socket?.current) {
            return;
        }


        // RECEIVE MESSAGE

        const handleReceiveMessage = (message) => {

            console.log(
                "📩 New message:",
                message
            );

            setMessages((prevMessages) => [
                ...prevMessages,
                message
            ]);

        };


        // MESSAGE ERROR

        const handleMessageError = (error) => {

            console.log(
                "❌ Message error:",
                error.message
            );

        };


        // USER ONLINE / OFFLINE

        const handleUserStatus = (data) => {

            console.log(
                "👤 Friend status changed:",
                data
            );

            if (data.userId === friendId) {

                setFriend((prevFriend) => {

                    if (!prevFriend) {
                        return prevFriend;
                    }

                    return {
                        ...prevFriend,
                        isOnline: data.isOnline,
                        lastSeen: data.lastSeen
                    };

                });

            }

        };


        // LISTENERS

        socket.current.on(
            "receive_message",
            handleReceiveMessage
        );

        socket.current.on(
            "message_error",
            handleMessageError
        );

        socket.current.on(
            "user_status",
            handleUserStatus
        );


        // CLEANUP

        return () => {

            socket.current?.off(
                "receive_message",
                handleReceiveMessage
            );

            socket.current?.off(
                "message_error",
                handleMessageError
            );

            socket.current?.off(
                "user_status",
                handleUserStatus
            );

        };

    }, [socket, friendId]);


    // =========================
    // FORMAT LAST SEEN
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


        const minutes = Math.floor(
            diff / 60
        );

        if (minutes < 60) {

            return `Last seen ${minutes} ${
                minutes === 1
                    ? "minute"
                    : "minutes"
            } ago`;

        }


        const hours = Math.floor(
            minutes / 60
        );

        if (hours < 24) {

            return `Last seen ${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            } ago`;

        }


        const days = Math.floor(
            hours / 24
        );

        return `Last seen ${days} ${
            days === 1
                ? "day"
                : "days"
        } ago`;

    }


    // =========================
    // SEND MESSAGE
    // =========================

    function sendMessage() {

        if (text.trim() === "") {
            return;
        }

        if (
            !socket?.current ||
            !socket.current.connected
        ) {

            console.log(
                "❌ Socket is not connected"
            );

            return;
        }


        socket.current.emit(
            "send_message",
            {
                receiverId: friendId,
                text: text.trim()
            }
        );

        setText("");

    }


    // =========================
    // UI
    // =========================

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex justify-center items-center px-4">

            <div className="w-full max-w-2xl h-[80vh] bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 flex flex-col">


                {/* HEADER */}

                <div className="p-5 border-b border-slate-700">

                    <h1 className="text-2xl font-bold text-green-400">

                        {friend?.name || "Chat"}

                    </h1>


                    {friend?.isOnline ? (

                        <p className="text-green-400 text-sm">

                            🟢 Online

                        </p>

                    ) : (

                        <p className="text-gray-400 text-sm">

                            ⚫ {formatLastSeen(
                                friend?.lastSeen
                            )}

                        </p>

                    )}

                </div>


                {/* MESSAGES */}

                <div className="flex-1 overflow-y-auto p-5 space-y-3">

                    {loading ? (

                        <p className="text-center text-gray-400">

                            Loading messages...

                        </p>

                    ) : messages.length === 0 ? (

                        <p className="text-center text-gray-400">

                            No messages yet.
                            Start the conversation!

                        </p>

                    ) : (

                        messages.map((message) => (

                            <div
                                key={message._id}
                                className={`flex ${
                                    message.sender ===
                                    localStorage.getItem("userId")
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >

                                <div className="bg-green-500 text-white px-4 py-2 rounded-xl max-w-[70%]">

                                    {message.text}

                                </div>

                            </div>

                        ))

                    )}

                    <div ref={messagesEndRef} />

                </div>


                {/* INPUT */}

                <div className="p-4 border-t border-slate-700 flex gap-3">

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) =>
                            setText(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {
                                sendMessage();
                            }

                        }}
                        className="flex-1 p-3 rounded-lg bg-slate-700 text-white border border-slate-600 outline-none focus:border-green-500"
                    />


                    <button
                        onClick={sendMessage}
                        className="bg-green-500 hover:bg-green-600 text-white px-5 rounded-lg transition"
                    >

                        Send

                    </button>

                </div>

            </div>

        </div>

    );

}

export default Chat;