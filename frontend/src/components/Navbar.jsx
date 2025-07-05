import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingBag } from 'react-icons/fa';
import ProfileDropdown from './ProfileDropdown.jsx';
import CartDropdown from './CartDropdown.jsx';
import { useCart } from '../contexts/CartContext.jsx';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  
  const navLink = (to, label) => (
    <Link
      to={to}
      className={`nav-link ${location.pathname === to ? 'nav-link-active' : ''}`}
    >
      {label}
    </Link>
  );
  
  return (
    <nav className="sticky top-0 z-50 bg-white/80 border-b border-gray-200/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7h18" />
                  </svg>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">CampusKart</h1>
                <p className="text-xs text-gray-500 -mt-1">Campus Marketplace</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navLink('/', 'Marketplace')}
              {navLink('/my-products', 'My Products')}
              {navLink('/sell', 'Sell')}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Dropdown */}
            <CartDropdown 
              cartItems={cartItems}
              onRemoveFromCart={removeFromCart}
              onUpdateQuantity={updateQuantity}
            />
            
            {/* User Actions */}
            {user ? (
              <ProfileDropdown user={user} />
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="btn btn-ghost"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200/50">
          <div className="flex items-center justify-center space-x-4">
            {navLink('/', 'Marketplace')}
            {navLink('/my-products', 'My Products')}
            {navLink('/sell', 'Sell')}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 