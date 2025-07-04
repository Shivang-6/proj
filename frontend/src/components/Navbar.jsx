import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingBag } from 'react-icons/fa';
import ProfileDropdown from './ProfileDropdown.jsx';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${location.pathname === to ? 'bg-blue-600 text-white shadow' : 'text-blue-700 hover:bg-blue-100 hover:text-blue-900'}`}
    >
      {label}
    </Link>
  );
  return (
    <nav className="w-full z-50 bg-white border-b border-gray-200 shadow-lg flex items-center justify-center px-8 py-3">
      <div className="flex items-center gap-4 justify-center">
        <a href="/" className="flex items-center gap-2 text-gray-800 font-semibold text-2xl tracking-tight">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7h18" />
          </svg>
          CampusKart
        </a>
        <a href="/" className="ml-6 text-base font-normal text-gray-700">Marketplace</a>
        <a href="/my-products" className="text-base font-normal text-gray-700">My Products</a>
        <a href="/sell" className="text-base font-normal text-gray-700">Sell</a>
      </div>
      <div className="flex items-center gap-4 ml-8">
        {user ? (
          <ProfileDropdown user={user} />
        ) : (
          navLink('/login', 'Login')
        )}
      </div>
    </nav>
  );
};

export default Navbar; 