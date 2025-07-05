// src/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaComments, FaCreditCard, FaShoppingCart, FaUserShield, FaSearch, FaTags } from 'react-icons/fa';

const features = [
  {
    icon: <FaComments className="w-8 h-8 text-pink-500" />,
    title: "In-App Chat",
    desc: "Chat instantly with buyers and sellers to negotiate, ask questions, and arrange meetups."
  },
  {
    icon: <FaCreditCard className="w-8 h-8 text-green-500" />,
    title: "Secure Payments",
    desc: "Pay securely through integrated payment gateways. Your transactions are protected."
  },
  {
    icon: <FaShoppingCart className="w-8 h-8 text-blue-500" />,
    title: "Smart Cart",
    desc: "Add items to your cart, review, and checkout with ease—just like your favorite e-commerce sites."
  },
  {
    icon: <FaUserShield className="w-8 h-8 text-purple-500" />,
    title: "Campus-Only Access",
    desc: "Only verified campus members can join, ensuring a safe and trusted marketplace."
  },
  {
    icon: <FaSearch className="w-8 h-8 text-yellow-500" />,
    title: "Powerful Search",
    desc: "Find exactly what you need with advanced filters for category, price, and more."
  },
  {
    icon: <FaTags className="w-8 h-8 text-indigo-500" />,
    title: "Great Deals",
    desc: "Discover amazing bargains on books, gadgets, accessories, and more—all from your campus community."
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-white to-teal-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row w-full max-w-6xl mb-12">
        {/* Left Section (Info + CTA) */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center items-start space-y-6">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight">
            Welcome to <span className="text-pink-500">CampusKart</span>
          </h1>
          <p className="text-gray-600 text-lg">
            CampusKart is your one-stop marketplace for students! Buy and sell items within your campus, find second-hand books, gadgets, and more. Enjoy secure payments, real-time chat, a smart cart, and a safe, campus-only community—all in one place built for you.
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

      {/* Features Section */}
      <div className="w-full max-w-6xl bg-white/80 rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Why Choose CampusKart?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-pink-50 transition">
              {feature.icon}
              <h3 className="mt-4 text-xl font-semibold text-gray-800">{feature.title}</h3>
              <p className="mt-2 text-gray-600 text-base">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
