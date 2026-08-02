import { useState } from "react";
import InputField from "../components/InputField";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
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
    <div className="container">
      <h1>Connectly</h1>

      <p>Welcome to my Chat Application</p>

      <InputField 
      label="Email"  
      placeholder="Enter Email" 
      type="text" 
      value={email} 
      onChange={(e)=>setEmail(e.target.value)}
      />

      <InputField 
      label="Password"
      placeholder="Enter Password" 
      type="password"
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
      />
      <br />
      <br />

      <button onClick={handleLogin}>Login</button>
      {/* <h3>Your Email: {email}</h3> */}

      <Link to="/register">
        <button>Register</button>
      </Link>

      <h2>Made by Raunak</h2>
    </div>
  );
}
export default Login;