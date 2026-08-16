import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useSocket } from "../context/SocketContext";

function Navbar() {

    const [requestCount, setRequestCount] = useState(0);

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
    // LOAD COUNT
    // =========================

    useEffect(() => {

        fetchRequestCount();

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

                    <Link
                        to="/profile"
                        className="text-gray-300 hover:text-green-400"
                    >
                        Profile
                    </Link>


                    <Link
                        to="/search"
                        className="text-gray-300 hover:text-green-400"
                    >
                        Search
                    </Link>


                    <Link
                        to="/friends"
                        className="text-gray-300 hover:text-green-400"
                    >
                        Friends
                    </Link>


                    <Link
                        to="/requests"
                        className="relative text-gray-300 hover:text-green-400"
                    >

                        Friend Requests


                        {/* BADGE */}

                        {requestCount > 0 && (

                            <span className="absolute -top-3 -right-4 bg-red-500 text-white text-xs font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">

                                {requestCount}

                            </span>

                        )}

                    </Link>


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