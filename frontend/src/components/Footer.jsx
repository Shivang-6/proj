import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaGithub,
  FaMapMarkerAlt,
  FaEnvelope,
  FaShieldAlt,
  FaCreditCard,
  FaComments,
  FaUsers,
  FaHeart
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7h18" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gradient">CampusKart</h3>
                <p className="text-sm text-gray-500">Campus Marketplace</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Connect with fellow students, buy and sell items within your campus community. 
              Safe, secure, and student-focused marketplace.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-blue-500 hover:text-white transition-all duration-200">
                <FaFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-blue-400 hover:text-white transition-all duration-200">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-pink-500 hover:text-white transition-all duration-200">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all duration-200">
                <FaLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                  Sell Items
                </Link>
              </li>
              <li>
                <Link to="/my-products" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                  My Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/chats" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                  Messages
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm">
                  Purchase History
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-6">Features</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-600 text-sm">
                <FaShieldAlt className="w-4 h-4 text-green-500" />
                <span>Secure Payments</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 text-sm">
                <FaComments className="w-4 h-4 text-blue-500" />
                <span>In-App Chat</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 text-sm">
                <FaUsers className="w-4 h-4 text-purple-500" />
                <span>Campus Only</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 text-sm">
                <FaCreditCard className="w-4 h-4 text-orange-500" />
                <span>Easy Transactions</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 text-sm">
                <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                <span>Local Pickup</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 text-sm">
                <FaHeart className="w-4 h-4 text-pink-500" />
                <span>Student Friendly</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm font-medium">Address</p>
                  <p className="text-gray-500 text-xs">Chitkara University, Baddi</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FaEnvelope className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm font-medium">Email</p>
                  <p className="text-gray-500 text-xs">iamshivanggautam@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>© {currentYear} CampusKart. All rights reserved.</span>
              <span>•</span>
              <Link to="#" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="#" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Made with</span>
              <FaHeart className="w-3 h-3 text-red-500" />
              <span>for students</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 