import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";


function SignUp() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [showCode, setShowCode] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        try {
            const response = await axios.post("http://localhost:5000/signUp", {
              email,
              password: code, // backend expects 'password', so we send code as password
            });
      
            alert("Registered successfully!");
          navigate("/dashboard");
          } catch (error) {
          // Check if error.response exists and has data.error
  if (error.response && error.response.data && error.response.data.error) {
    alert("Error: " + error.response.data.error);
  } else {
    alert("Error: " + error.message || "Unknown error");
  }
}
        };

    const handleLogin = () => {
        alert("Navigate to login (add router later)");
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "400px" }}>
            <h2 className="mb-4 text-center">Sign Up</h2>

            {/* Email Input */}
            <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                />
            </div>

            {/* Code Input + Show Code */}
            <div className="mb-3">
                <label className="form-label">Enter Code</label>
                <div className="input-group">
                    <input
                        type={showCode ? "text" : "password"} // Show code if showCode is true, otherwise show password
                        className="form-control"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter code"
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowCode(!showCode)}
                        style={{ marginLeft: "10px" }}
                        title={showCode ? "Hide code" : "Show code"}

                    > 
                    👁️
                   
                    </button>
                   
                </div>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-between">
                <button className="btn btn-primary" onClick={handleSignUp}>
                    Sign Up
                </button>
                <button className="btn btn-link" onClick={handleLogin}>
                    Log In
                </button>
            </div>

        </div>
    );
}

export default SignUp;
