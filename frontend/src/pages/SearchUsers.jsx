import { useState, useEffect } from "react";
import API from "../api/axios";

function SearchUsers() {

    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);

    useEffect(() => {

        async function fetchUsers() {

            try {

                const token = localStorage.getItem("token");

                const response = await API.get(`/users?search=${search}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUsers(response.data);

            } catch (error) {

                console.log(error);

            }

        }

        fetchUsers();

    }, [search]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex justify-center items-start pt-16 px-4">

            <div className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700">

                <h1 className="text-4xl font-bold text-green-400 text-center">
                    Search Users
                </h1>

                <p className="text-center text-gray-400 mt-2 mb-8">
                    Find people on Connectly
                </p>

                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 outline-none focus:border-green-500"
                />

                <p className="text-gray-400 mt-4">
                    {search === ""
                        ? `Showing ${users.length} users`
                        : `${users.length} users found`}
                </p>

                <div className="mt-8 space-y-4">

                    {users.length === 0 && search !== "" ? (
                        <p className="text-center text-gray-400">
                            No users found
                        </p>
                    ) : (

                        users.map((user) => (

                            <div
                                key={user._id}
                                className="bg-slate-700 rounded-xl p-5 flex justify-between items-center"
                            >

                                <div className="flex items-center gap-4">

                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <h2 className="text-white font-semibold text-lg">
                                            {user.name}
                                        </h2>

                                        <p className="text-gray-400">
                                            {user.email}
                                        </p>
                                    </div>

                                </div>

                                <button 
                                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition shrink-0"
                                >
                                    Add Friend
                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>
    );
}

export default SearchUsers;