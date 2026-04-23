import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './LoginPage.css';

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const login = async () => {
        setError(null);
        try {
            const res = await axios.post("/api/auth/login", { password });
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data || "Login failed. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <h1 className="login-title">LTO IMS</h1>
            <h1 className="login-title2">ADMIN LOGIN</h1>
            <input
                className="password-input"
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                value={password}
            />
            <button className="login-button" onClick={login}>Login</button>
            {error && <p className="login-error">{error}</p>}
            {!error && <p className="login-error" style={{color: '#1E1E1E'}}>No Error</p>}
        </div>
    );
}