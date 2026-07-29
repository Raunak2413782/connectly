import {Link} from "react-router-dom";
import InputField from "../components/InputField";
import {useState} from "react";
import AuthHeader from "../components/AuthHeader";
function Register(){
        const[email,setEmail] = useState("");
        const[password,setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");

        async function handleRegister(){
            if(email==="" || password==="" || confirmPassword===""){
                alert("Please enter email and password");
                return;
            }else if(password.length<6){
                alert("password must be greater than 6");
                return;
            }else if(password!=confirmPassword){
                alert("Both Password are not same! try again!");
                return;
            }
            console.log("Registration Successful");
            const response = await fetch("http://localhost:3000/register",{
                method:"POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            console.log(response);
        }
    return (
        <div>
            <AuthHeader
            title="Connectly"
            subtitle="Create Account"
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

            <button onClick={handleRegister}>Register</button>
            <h3>Already have an account?</h3>
         <Link to="/">
            <button>Login</button>
         </Link>
        </div>
    );
}
export default Register;