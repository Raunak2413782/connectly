import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { io } from "socket.io-client";

function Chat() {

    const { friendId } = useParams();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);
    const socket = useRef(null);

    const token = localStorage.getItem("token");

    useEffect(() => {

        async function fetchMessages() {

            try {

                const response = await API.get(`/messages/${friendId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMessages(response.data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        }

        fetchMessages();

    }, [friendId, token]);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);

    useEffect(() => {
            const newSocket = io("http://localhost:3000", {
        auth: {
            userId: localStorage.getItem("userId")
        }
    });

    socket.current = newSocket;

    newSocket.on("connect", () => {
        console.log("🟢 Socket connected:", newSocket.id);
    });

    newSocket.on("receive_message", (message) => {

        console.log("📩 New message:", message);

        setMessages((prevMessages) => [
            ...prevMessages,
            message
        ]);
    });

    newSocket.on("message_error", (error) => {
        console.log("❌ Message error:", error.message);
    });

    return () => {

        console.log("🔴 Disconnecting socket:", newSocket.id);

        newSocket.disconnect();

    };

}, []);

    function sendMessage() {

        if (text.trim() === "") {
            return;
        }

        if (!socket.current || !socket.current.connected) {
            console.log("❌ Socket is not connected");
            return;
        }

        socket.current.emit("send_message", {
            receiverId: friendId,
            text: text.trim()
        });

        setText("");

    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex justify-center items-center px-4">

            <div className="w-full max-w-2xl h-[80vh] bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 flex flex-col">

                {/* Header */}

                <div className="p-5 border-b border-slate-700">

                    <h1 className="text-2xl font-bold text-green-400">
                        Chat
                    </h1>

                    <p className="text-gray-400 text-sm">
                        Connected with friend
                    </p>

                </div>


                {/* Messages */}

                <div className="flex-1 overflow-y-auto p-5 space-y-3">

                    {loading ? (

                        <p className="text-center text-gray-400">
                            Loading messages...
                        </p>

                    ) : messages.length === 0 ? (

                        <p className="text-center text-gray-400">
                            No messages yet. Start the conversation!
                        </p>

                    ) : (

                        messages.map((message) => (

                            <div
                                key={message._id}
                                className={`flex ${
                                    message.sender === localStorage.getItem("userId")
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


                {/* Input */}

                <div className="p-4 border-t border-slate-700 flex gap-3">

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
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