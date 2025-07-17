import { useState } from "react";
import axios from "axios";


function SignUp ({sign}){
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const regester = async () => {
        try {
        const response = await axios.post("http://localhost:5000/signUp", {
            email,
            password
        });
        console.log("User registered:", response.data);
        alert("Registration successful!");
        sign(); // Navigate to login
    }   catch (err) {
        alert("Registration failed: " + (err.response?.data?.message || err.message));

        }};

    return (
        <div>
    <h2>Sign Up</h2>
    <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
    <button onClick={regester}>Register</button>
        </div>
    );
}
export default SignUp;