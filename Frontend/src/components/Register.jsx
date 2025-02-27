import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const url = process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://fj-be-r2-soham-sanghavi-iiitp-1.onrender.com";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${url}/api/auth/register`, {
                name,
                email,
                password,
            });
            setMessage(response.data.message);
            navigate('/')
        } catch (error) {
            // console.log(error.response)
            setMessage(error.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center mb-4">Create an Account</h2>
                {message && <p className="text-center text-red-500">{message}</p>}
                <form onSubmit={handleRegister} className="space-y-4">
                    <input type="text" placeholder="Name" className="w-full p-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="email" placeholder="Email" className="w-full p-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full p-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        Register
                    </button>
                </form>
                <p className="text-center mt-4">
                    Already have an account? <Link to="/" className="text-blue-500 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
