import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
        <>
            <h1>Login</h1>
            <input
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                value={password}
            />
            <button onClick={login}>Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
    );
}