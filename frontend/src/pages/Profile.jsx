import { useEffect, useState } from "react";
import API from "../api/axios";

function Profile() {

    const [user, setUser] = useState(null);

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
        return <h2>Loading...</h2>;
    }

    return (
        <div>
            <h1>Profile Page</h1>

            <h2>Name: {user.name}</h2>

            <h2>Email: {user.email}</h2>

            <h2>DOB: {new Date(user.dob).toLocaleDateString()}</h2>
        </div>
    );
}

export default Profile;