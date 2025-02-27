import { useState } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const url = process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://fj-be-r2-soham-sanghavi-iiitp-1.onrender.com";

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // console.log("hello");

                // Fetch user info from Google API
                const res = await axios.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                    }
                );

                const { sub, name, email } = res.data;

                // Send user data to backend
                const backendRes = await axios.post(
                    `${url}/api/auth/google`,
                    {
                        google_id: sub,
                        name,
                        email,
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                );

                const token = backendRes.data.token;
                // console.log("Soham:",backendRes.data)
                localStorage.setItem("token", token);
                localStorage.setItem("user", backendRes.data.user);
                window.location.href = "/dashboard";
            } catch (error) {
                console.error("Google login failed:", error);
            }
        },
    });


    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${url}/api/auth/login`, {
                email,
                password,
            });
            console.log("res:", response.data)
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", response.data.user.id);
            setMessage("Login successful!");
            navigate("/Dashboard");
        } catch (error) {
            setMessage(error.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center mb-4">Welcome Back</h2>
                {message && <p className="text-center text-red-500">{message}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full p-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full p-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
                        Login
                    </button>
                </form>
                <div className="flex justify-center items-center mt-3">
                <button onClick={() => login()} className="bg-blue-500 text-white px-4 py-2">
                    Sign in with Google
                </button>
                </div>
                <p className="text-center mt-4">
                    Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
