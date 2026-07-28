import {useState} from "react";
import InputField from "../components/InputField";
import {Link} from "react-router-dom";
function Login(){
     const[email,setEmail] = useState("");
  const[password,setPassword] = useState("");

  function handleLogin() {
    if(email==="" || password===""){
        alert("please enter email and password");
        return;
    }else if(password.length <6){
      alert("password must be greater than 6");
      return;
    }
        console.log("Email: ",email);
        console.log("Password: ",password);
        console.log("Login Successful");
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