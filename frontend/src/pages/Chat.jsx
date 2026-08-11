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

    // Friend information
    const [friend, setFriend] = useState(null);

    // Friend typing status
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const token = localStorage.getItem("token");


    // =========================
    // FETCH MESSAGES
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

                setMessages(response.data.messages || []);

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
    // FETCH FRIEND DETAILS
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

                const friends = response.data.friends || [];

                const currentFriend = friends.find(
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

    }, [messages, isTyping]);


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

        const minutes = Math.floor(diff / 60);

        if (minutes < 60) {

            return `Last seen ${minutes} ${
                minutes === 1
                    ? "minute"
                    : "minutes"
            } ago`;

        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {

            return `Last seen ${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            } ago`;

        }

        const days = Math.floor(hours / 24);

        return `Last seen ${days} ${
            days === 1
                ? "day"
                : "days"
        } ago`;

    }


    // =========================
    // SOCKET LISTENERS
    // =========================

    useEffect(() => {

        if (!socket?.current) {
            return;
        }


        // =========================
        // RECEIVE MESSAGE
        // =========================

        const handleReceiveMessage = (message) => {

            console.log(
                "📩 New message:",
                message
            );

            // Only add messages belonging to this chat
            const isThisChat =
                (
                    message.sender === friendId &&
                    message.receiver === localStorage.getItem("userId")
                ) ||
                (
                    message.sender === localStorage.getItem("userId") &&
                    message.receiver === friendId
                );

            if (!isThisChat) {
                return;
            }

            setMessages((prevMessages) => {

                // Prevent duplicate message
                const alreadyExists = prevMessages.some(
                    (msg) => msg._id === message._id
                );

                if (alreadyExists) {
                    return prevMessages;
                }

                return [
                    ...prevMessages,
                    message
                ];

            });

        };


        // =========================
        // FRIEND STARTED TYPING
        // =========================

        const handleUserTyping = (data) => {

            if (data.userId === friendId) {

                console.log(
                    "⌨️ Friend is typing..."
                );

                setIsTyping(true);

            }

        };


        // =========================
        // FRIEND STOPPED TYPING
        // =========================

        const handleUserStoppedTyping = (data) => {

            if (data.userId === friendId) {

                console.log(
                    "⏹️ Friend stopped typing"
                );

                setIsTyping(false);

            }

        };


        // =========================
        // USER ONLINE / OFFLINE
        // =========================

        const handleUserStatus = (data) => {

            if (data.userId !== friendId) {
                return;
            }

            console.log(
                "👤 Friend status changed:",
                data
            );

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

        };


        // =========================
        // MESSAGE ERROR
        // =========================

        const handleMessageError = (error) => {

            console.log(
                "❌ Message error:",
                error.message
            );

        };


        // Register listeners

        socket.current.on(
            "receive_message",
            handleReceiveMessage
        );

        socket.current.on(
            "user_typing",
            handleUserTyping
        );

        socket.current.on(
            "user_stopped_typing",
            handleUserStoppedTyping
        );

        socket.current.on(
            "user_status",
            handleUserStatus
        );

        socket.current.on(
            "message_error",
            handleMessageError
        );


        // =========================
        // CLEANUP
        // =========================

        return () => {

            socket.current?.off(
                "receive_message",
                handleReceiveMessage
            );

            socket.current?.off(
                "user_typing",
                handleUserTyping
            );

            socket.current?.off(
                "user_stopped_typing",
                handleUserStoppedTyping
            );

            socket.current?.off(
                "user_status",
                handleUserStatus
            );

            socket.current?.off(
                "message_error",
                handleMessageError
            );

        };

    }, [socket, friendId]);


    // =========================
    // TYPING HANDLER
    // =========================

    function handleTyping(e) {

        const value = e.target.value;

        setText(value);


        if (
            !socket?.current ||
            !socket.current.connected
        ) {

            return;

        }


        // =========================
        // EMPTY INPUT
        // =========================

        if (value.trim() === "") {

            socket.current.emit(
                "typing_stop",
                {
                    receiverId: friendId
                }
            );

            if (typingTimeoutRef.current) {

                clearTimeout(
                    typingTimeoutRef.current
                );

                typingTimeoutRef.current = null;

            }

            return;

        }


        // =========================
        // START TYPING
        // =========================

        if (!typingTimeoutRef.current) {

            socket.current.emit(
                "typing_start",
                {
                    receiverId: friendId
                }
            );

        }


        // Clear old timeout

        if (typingTimeoutRef.current) {

            clearTimeout(
                typingTimeoutRef.current
            );

        }


        // Stop typing after 800ms

        typingTimeoutRef.current = setTimeout(() => {

            socket.current?.emit(
                "typing_stop",
                {
                    receiverId: friendId
                }
            );

            typingTimeoutRef.current = null;

        }, 800);

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


        // Send message

        socket.current.emit(
            "send_message",
            {
                receiverId: friendId,
                text: text.trim()
            }
        );


        // Stop typing

        socket.current.emit(
            "typing_stop",
            {
                receiverId: friendId
            }
        );


        // Clear timeout

        if (typingTimeoutRef.current) {

            clearTimeout(
                typingTimeoutRef.current
            );

            typingTimeoutRef.current = null;

        }


        // Clear input

        setText("");

    }


    // =========================
    // CLEANUP TYPING TIMEOUT
    // =========================

    useEffect(() => {

        return () => {

            if (typingTimeoutRef.current) {

                clearTimeout(
                    typingTimeoutRef.current
                );

            }

        };

    }, []);


    // =========================
    // UI
    // =========================

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex justify-center items-center px-4">

            <div className="w-full max-w-2xl h-[80vh] bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 flex flex-col">


                {/* =========================
                    HEADER
                ========================= */}

                <div className="p-5 border-b border-slate-700">

                    <div className="flex items-center gap-3">


                        {/* PROFILE CIRCLE */}

                        <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">

                            {friend?.name
                                ?.charAt(0)
                                .toUpperCase() || "?"}

                        </div>


                        {/* NAME + STATUS */}

                        <div>

                            <h1 className="text-lg font-bold text-white">

                                {friend?.name || "Loading..."}

                            </h1>


                            {/* TYPING */}

                            {isTyping ? (

                                <p className="text-green-400 text-sm">

                                    typing...

                                </p>


                            ) : friend?.isOnline ? (

                                <p className="text-green-400 text-sm">

                                    🟢 Online

                                </p>


                            ) : (

                                <p className="text-gray-500 text-sm">

                                    ⚫{" "}
                                    {formatLastSeen(
                                        friend?.lastSeen
                                    )}

                                </p>

                            )}

                        </div>

                    </div>

                </div>


                {/* =========================
                    MESSAGES
                ========================= */}

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


                {/* =========================
                    INPUT
                ========================= */}

                <div className="p-4 border-t border-slate-700 flex gap-3">

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={handleTyping}
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {

                                e.preventDefault();

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