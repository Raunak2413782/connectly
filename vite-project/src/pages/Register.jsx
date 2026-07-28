import {Link} from "react-router-dom";
function Register(){
    return (
        <div>
            <h1>Register Page</h1>
         <Link to="/">
            <button>Back to Login</button>
         </Link>
        </div>
    );
}
export default Register;