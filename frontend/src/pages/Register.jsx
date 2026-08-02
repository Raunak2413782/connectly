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
            if(email==="" || password==="" || confirmPassword==="" || dob===""){
                alert("Please fill all the fields");
                return;
            }else if(password.length<6){
                alert("password must be greater than 6");
                return;
            }else if(password!==confirmPassword){
                alert("Both Password are not same! try again!");
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
        <div>
            <AuthHeader
            title="Connectly"
            subtitle="Create Account"
            />

            <InputField
            label="Name"
            placeholder="Enter Name"
            type="text"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            />

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
            <InputField 
                label="Confirm Password"
                placeholder="Confirm Password" 
                type="password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
            />

            <InputField
            label="Date of Birth"
            type="date"
            value={dob}
            onChange={(e)=>setDob(e.target.value)}
            />

            <button onClick={handleRegister}>Register</button>
            <h3>Already have an account?</h3>
         <Link to="/">
            <button>Login</button>
         </Link>
        </div>
    );
}
export default Register;