// src/pages/Login.jsx
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.open(`${import.meta.env.VITE_API_URL}/auth/google`, "_self");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      if (res.data.success) {
        navigate("/landing");
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Login to CampusKart</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg px-6 py-3 shadow hover:shadow-md transition duration-300 mb-2"
        >
          <FcGoogle className="mr-3 text-2xl" />
          <span className="text-gray-700 font-medium">Sign in with Google</span>
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <p className="mt-4 text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
