import { useState } from "react";
import InputField from "../components/InputField";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import AuthHeader from "../components/AuthHeader";
function Login(){
  const navigate = useNavigate();

  const[email,setEmail] = useState("");
  const[password,setPassword] = useState("");

  async function handleLogin() {
    if(email==="" || password===""){
        alert("please enter email and password");
        return;
    }else if(password.length <6){
      alert("password must be greater than 6");
      return;
    }

    try {
        const response = await API.post("/login", {
            email,
            password
        });

        console.log(response.data);
        
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.user._id);

        alert(response.data.message);

        navigate("/profile");

    } catch (error) {

        console.log(error);

        if (error.response) {
            alert(error.response.data);
        } else {
            alert("Login Failed");
        }

    }
}
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700">
      <AuthHeader
        title="Connectly"
        subtitle="Welcome Back 👋"
      />

      <InputField
        label="Email"
        placeholder="Enter Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <InputField
        label="Password"
        placeholder="Enter Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="w-full bg-green-500 hover:bg-green-600 active:scale-95 transition-all duration-200 text-white font-semibold py-3 rounded-lg mt-6 shadow-lg"
      >
        Login
      </button>

      <p className="text-center text-gray-400 mt-6">
        Don't have an account?
      </p>

      <Link to="/register">
        <button className="w-full mt-3 border border-green-500 text-green-400 py-3 rounded-lg hover:bg-green-500 hover:text-white active:scale-95 transition-all duration-200">
          Register
        </button>
      </Link>

    </div>
  </div>
);
}
export default Login;