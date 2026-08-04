import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Profile() {

    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/");
    }

    useEffect(() => {

    async function fetchProfile() {

        try {

            const token = localStorage.getItem("token");

            const response = await API.get("/profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log(response.data);

            setUser(response.data);

        } catch (error) {
            console.log(error);
            alert("Failed to load profile");
        }

    }

    fetchProfile();

}, []);

    if (!user) {
    return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex items-center justify-center">
                <h2 className="text-white text-2xl">Loading...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex items-center justify-center px-4">

            <div className="w-full max-w-lg bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700">

                <h1 className="text-4xl font-bold text-green-400 text-center">
                    Connectly
                </h1>

                <p className="text-center text-gray-400 mt-2 mb-8">
                    Welcome Back 👋
                </p>

                <div className="space-y-5">

                    <div className="bg-slate-700 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Name</p>
                        <h2 className="text-white text-xl font-semibold">
                            {user.name}
                        </h2>
                    </div>

                    <div className="bg-slate-700 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Email</p>
                        <h2 className="text-white text-xl font-semibold">
                            {user.email}
                        </h2>
                    </div>

                    <div className="bg-slate-700 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Date of Birth</p>
                        <h2 className="text-white text-xl font-semibold">
                            {new Date(user.dob).toLocaleDateString()}
                        </h2>
                    </div>

                </div>

                <button
                    onClick={handleLogout}
                    className="w-full mt-8 bg-red-500 hover:bg-red-600 active:scale-95 transition-all duration-200 text-white font-semibold py-3 rounded-lg shadow-lg"
                >
                    Logout
                </button>

            </div>

        </div>
    );
}

export default Profile;