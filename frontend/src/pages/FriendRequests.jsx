import { useEffect, useState } from "react";
import API from "../api/axios";

function FriendRequests() {

    const [requests, setRequests] = useState([]);

    useEffect(() => {

        fetchRequests();

    }, []);

    async function fetchRequests() {

        try {

            const token = localStorage.getItem("token");

            const response = await API.get("/friend-requests", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setRequests(response.data);

        } catch (error) {

            console.log(error);

        }

    }
    async function acceptRequest(requestId) {

        try {

            const token = localStorage.getItem("token");

            await API.put(
                `/friend-request/${requestId}/accept`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            fetchRequests();

        } catch (error) {

            console.log(error);

        }

    }

    async function rejectRequest(requestId) {

        try {

            const token = localStorage.getItem("token");

            await API.put(
                `/friend-request/${requestId}/reject`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            fetchRequests();

        } catch (error) {

            console.log(error);

        }

    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex justify-center pt-16">

            <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-8 shadow-2xl">

                <h1 className="text-4xl text-green-400 font-bold text-center">
                    Friend Requests
                </h1>

                <p className="text-gray-400 text-center mt-2">
                    Pending Requests
                </p>

                <div className="mt-8 space-y-4">

                    {requests.length === 0 ? (

                        <p className="text-center text-gray-400">
                            No Pending Requests
                        </p>

                    ) : (

                        requests.map((request) => (

                            <div
                                key={request._id}
                                className="bg-slate-700 rounded-xl p-5 flex justify-between items-center"
                            >

                                <div>

                                    <h2 className="text-white text-xl font-semibold">
                                        {request.sender.name}
                                    </h2>

                                    <p className="text-gray-400">
                                        {request.sender.email}
                                    </p>

                                </div>

                                <div className="flex gap-3">

                                    <button
                                        onClick={() => acceptRequest(request._id)}
                                        className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg text-white"
                                    >
                                        Accept
                                    </button>

                                    <button
                                        onClick={() => rejectRequest(request._id)}
                                        className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg text-white"
                                    >
                                        Reject
                                    </button>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>
    );
}

export default FriendRequests;