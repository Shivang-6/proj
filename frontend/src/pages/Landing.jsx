// src/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-white to-teal-100 flex items-center justify-center px-6 py-12">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row w-full max-w-6xl">
        {/* Left Section (Info + CTA) */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center items-start space-y-6">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight">
            Welcome to <span className="text-pink-500">CampusKart</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Buy & sell items within your campus, find second-hand books, gadgets,
            and more — all in one place built for students like you!
          </p>
          <Link to="/login">
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full text-lg shadow-lg transition duration-300">
              Go to Login
            </button>
          </Link>
          <p className="text-sm text-gray-400">
            Secure. Convenient. Built for campus life.
          </p>
        </div>

        {/* Right Section (Image / Illustration) */}
        <div className="md:w-1/2 bg-pink-100 flex items-center justify-center p-8">
          <img
            src="https://illustrations.popsy.co/white/marketplace.svg"
            alt="Campus Marketplace"
            className="w-full max-w-xs md:max-w-sm hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
