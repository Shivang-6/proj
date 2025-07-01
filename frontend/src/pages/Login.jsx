// src/pages/Login.jsx
import React from "react";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const handleGoogleLogin = () => {
    window.open(`${import.meta.env.VITE_API_URL}/auth/google`, "_self");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome Back!</h2>
        <p className="text-gray-500 mb-6">Sign in to continue to <span className="font-semibold text-indigo-600">CampusKart</span></p>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg px-6 py-3 shadow hover:shadow-md transition duration-300"
        >
          <FcGoogle className="mr-3 text-2xl" />
          <span className="text-gray-700 font-medium">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
