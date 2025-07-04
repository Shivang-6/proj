import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="w-full mt-auto py-4 px-8 bg-white border-t border-white shadow-lg rounded-t-2xl text-center text-cyan-100 font-medium text-base">
    <span className="tracking-wide">© {new Date().getFullYear()} CampusKart. All rights reserved.</span>
  </footer>
);

export default Footer; 