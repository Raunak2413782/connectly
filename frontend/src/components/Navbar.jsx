import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useSocket } from "../context/SocketContext";

function Navbar() {

    const [requestCount, setRequestCount] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    const socket = useSocket();

    const location = useLocation();

    const navigate = useNavigate();


    // =========================
    // GET PENDING REQUEST COUNT
    // =========================

    async function fetchRequestCount() {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await API.get(
                "/friend-requests",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = response.data;

            const requests = Array.isArray(data)
                ? data
                : data.requests || [];

            setRequestCount(requests.length);

        } catch (error) {

            console.log(
                "Request count error:",
                error
            );

        }

    }


    // =========================
    // GET UNREAD MESSAGE COUNT
    // =========================

    async function fetchUnreadMessageCount() {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await API.get(
                "/messages/unread-count",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUnreadMessageCount(
                response.data.unreadCount || 0
            );

        } catch (error) {

            console.log(
                "Unread message count error:",
                error
            );

        }

    }


    // =========================
    // LOAD COUNTS
    // =========================

    useEffect(() => {

        fetchRequestCount();
        fetchUnreadMessageCount();

    }, [location.pathname]);


    // =========================
    // REQUEST COUNT CHANGED
    // =========================

    useEffect(() => {

        const handleRequestCountChanged = () => {

            console.log(
                "🔄 Updating friend request count"
            );

            fetchRequestCount();

        };

        window.addEventListener(
            "friend_request_count_changed",
            handleRequestCountChanged
        );

        return () => {

            window.removeEventListener(
                "friend_request_count_changed",
                handleRequestCountChanged
            );

        };

    }, []);


    // =========================
    // REAL-TIME FRIEND REQUEST
    // =========================

    useEffect(() => {

        if (!socket?.current) {
            return;
        }


        const handleNewFriendRequest = (data) => {

            console.log(
                "🔔 Navbar new friend request:",
                data
            );

            setRequestCount(
                (prev) => prev + 1
            );

        };


        const registerListener = () => {

            console.log(
                "🟢 Navbar friend request listener registered"
            );

            socket.current?.on(
                "new_friend_request",
                handleNewFriendRequest
            );

        };


        if (socket.current.connected) {

            registerListener();

        }


        socket.current.on(
            "connect",
            registerListener
        );


        return () => {

            socket.current?.off(
                "connect",
                registerListener
            );

            socket.current?.off(
                "new_friend_request",
                handleNewFriendRequest
            );

        };

    }, [socket]);


    // =========================
    // REAL-TIME UNREAD MESSAGE
    // =========================

    useEffect(() => {

        if (!socket?.current) {
            return;
        }


        const handleNewMessage = (message) => {

            console.log(
                "📩 Navbar new message:",
                message
            );


            const currentUserId =
                localStorage.getItem("userId");


            if (
                message.receiver?.toString() ===
                currentUserId?.toString()
            ) {

                setUnreadMessageCount(
                    (prev) => prev + 1
                );

            }

        };


        const registerMessageListener = () => {

            console.log(
                "🟢 Navbar message listener registered"
            );

            socket.current?.on(
                "receive_message",
                handleNewMessage
            );

        };


        if (socket.current.connected) {

            registerMessageListener();

        }


        socket.current.on(
            "connect",
            registerMessageListener
        );


        return () => {

            socket.current?.off(
                "connect",
                registerMessageListener
            );

            socket.current?.off(
                "receive_message",
                handleNewMessage
            );

        };

    }, [socket]);


    // =========================
    // LOGOUT
    // =========================

    function handleLogout() {

        localStorage.removeItem("token");

        localStorage.removeItem("userId");

        navigate("/");

    }


    // =========================
    // HIDE NAVBAR ON LOGIN
    // =========================

    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }


    return (

        <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4">

            <div className="max-w-6xl mx-auto flex items-center justify-between">

                {/* LOGO */}

                <Link
                    to="/profile"
                    className="text-2xl font-bold text-green-400"
                >
                    Connectly
                </Link>


                {/* NAVIGATION */}

                <div className="flex items-center gap-6">

                    {/* PROFILE */}

                    <Link
                        to="/profile"
                        className="text-gray-300 hover:text-green-400"
                    >
                        Profile
                    </Link>


                    {/* SEARCH */}

                    <Link
                        to="/search"
                        className="text-gray-300 hover:text-green-400"
                    >
                        Search
                    </Link>


                    {/* FRIENDS */}

                    <Link
                        to="/friends"
                        className="text-gray-300 hover:text-green-400"
                    >
                        Friends
                    </Link>


                    {/* FRIEND REQUESTS */}

                    <Link
                        to="/requests"
                        className="relative text-gray-300 hover:text-green-400"
                    >

                        Friend Requests


                        {requestCount > 0 && (

                            <span className="absolute -top-3 -right-4 bg-red-500 text-white text-xs font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">

                                {requestCount}

                            </span>

                        )}

                    </Link>


                    {/* CHATS */}

                    <Link
                        to="/chats"
                        className="relative text-gray-300 hover:text-green-400"
                    >

                        Chats


                        {unreadMessageCount > 0 && (

                            <span className="absolute -top-3 -right-4 bg-red-500 text-white text-xs font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">

                                {unreadMessageCount}

                            </span>

                        )}

                    </Link>


                    {/* LOGOUT */}

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>

                </div>

            </div>

        </nav>

    );

}

export default Navbar;