import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Chats() {

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    // =========================
    // FETCH RECENT CHATS
    // =========================

    async function fetchChats(signal) {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            const response = await API.get(
                "/messages/recent",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    signal
                }
            );

            setChats(
                response.data.chats || []
            );

        } catch (error) {

            // Request cancel hone par error ignore karo
            if (error.name !== "CanceledError") {

                console.log(
                    "Get recent chats error:",
                    error
                );

            }

        } finally {

            setLoading(false);

        }

    }


    // =========================
    // LOAD CHATS
    // =========================

    useEffect(() => {

        const controller = new AbortController();

        fetchChats(controller.signal);

        return () => {

            controller.abort();

        };

    }, []);


    // =========================
    // FORMAT TIME
    // =========================

    function formatTime(date) {

        if (!date) {
            return "";
        }

        return new Date(date).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex justify-center pt-16">

            <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-8 shadow-2xl">

                {/* HEADER */}

                <h1 className="text-4xl text-green-400 font-bold text-center">

                    Chats

                </h1>

                <p className="text-gray-400 text-center mt-2">

                    Your recent conversations

                </p>


                {/* CHAT LIST */}

                <div className="mt-8 space-y-3">

                    {loading ? (

                        <p className="text-center text-gray-400">
                            Loading chats...
                        </p>

                    ) : chats.length === 0 ? (

                        <p className="text-center text-gray-400">
                            No conversations yet
                        </p>

                    ) : (

                        chats.map((chat) => (

                            <div
                                key={chat.friend._id}
                                onClick={() =>
                                    navigate(
                                        `/chat/${chat.friend._id}`
                                    )
                                }
                                className="bg-slate-700 hover:bg-slate-600 rounded-xl p-4 flex items-center justify-between cursor-pointer transition"
                            >

                                {/* USER INFO */}

                                <div className="flex items-center gap-4">

                                    {/* AVATAR */}

                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold">

                                        {chat.friend.name
                                            ?.charAt(0)
                                            .toUpperCase()
                                        }

                                    </div>


                                    {/* NAME + MESSAGE */}

                                    <div>

                                        <h2 className="text-white text-lg font-semibold">

                                            {chat.friend.name}

                                        </h2>


                                        <p className="text-gray-400 text-sm">

                                            {chat.lastMessage
                                                ? chat.lastMessage.isDeleted
                                                    ? "This message was deleted"
                                                    : chat.lastMessage.text
                                                : "No messages yet"
                                            }

                                        </p>

                                    </div>

                                </div>


                                {/* RIGHT SIDE */}

                                <div className="flex flex-col items-end gap-2">

                                    {/* TIME */}

                                    {chat.lastMessage && (

                                        <span className="text-gray-400 text-xs">

                                            {formatTime(
                                                chat.lastMessage.createdAt
                                            )}

                                        </span>

                                    )}


                                    {/* UNREAD COUNT */}

                                    {chat.unreadCount > 0 && (

                                        <span className="bg-green-500 text-white text-xs font-bold min-w-6 h-6 px-2 rounded-full flex items-center justify-center">

                                            {chat.unreadCount}

                                        </span>

                                    )}

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>

    );

}

export default Chats;