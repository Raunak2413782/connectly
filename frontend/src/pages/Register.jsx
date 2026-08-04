import {Link} from "react-router-dom";
import InputField from "../components/InputField";
import {useState} from "react";
import AuthHeader from "../components/AuthHeader";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Register(){

        const navigate = useNavigate();

        const [name, setName] = useState("");
        const [dob, setDob] = useState("");
        const[email,setEmail] = useState("");
        const[password,setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");

        async function handleRegister(){
            if(name==="" || email==="" || password==="" || confirmPassword==="" || dob===""){
                alert("Please fill all the fields");
                return;
            }else if(password.length<6){
                alert("Password must be at least 6 characters");
                return;
            }else if(password!==confirmPassword){
                alert("Passwords do not match");
                return;
            }

            try {
                const response = await API.post("/register", {
                    name,
                    email,
                    password,
                    dob
                });

                console.log(response.data);
                alert(response.data);
                navigate("/");

            }catch (error) {
                console.log(error);

                if (error.response) {
                    alert(error.response.data);
                } else {
                    alert("Registration Failed");
                }
            }
        }
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700">

      <AuthHeader
        title="Connectly"
        subtitle="Create your account and start chatting"
      />

      <InputField
        label="Name"
        placeholder="Enter Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
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

      <InputField
        label="Confirm Password"
        placeholder="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <InputField
        label="Date of Birth"
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="w-full bg-green-500 hover:bg-green-600 active:scale-95 transition-all duration-200 text-white font-semibold py-3 rounded-lg mt-6 shadow-lg"
      >
        Register
      </button>

      <p className="text-center text-gray-400 mt-6 text-sm">
        Already have an account?
      </p>

      <Link to="/">
        <button
          className="w-full mt-3 border border-green-500 text-green-400 py-3 rounded-lg hover:bg-green-500 hover:text-white active:scale-95 transition-all duration-200"
        >
          Login
        </button>
      </Link>

    </div>
  </div>
);
}
export default Register;