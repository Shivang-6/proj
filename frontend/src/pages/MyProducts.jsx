import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ImageGallery from "../components/ImageGallery.jsx";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import { FaStar } from 'react-icons/fa';

const MyProducts = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/login/success`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchMyProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products?seller=${user._id}`, { withCredentials: true });
        if (res.data.success) {
          setProducts(res.data.products);
        } else {
          setError("Failed to fetch your products");
        }
      } catch (err) {
        setError("Failed to load your products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, [user]);

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your products</h2>
          <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">CampusKart</h1>
          <nav className="flex gap-4 items-center">
            <Link
              to="/landing"
              className="text-blue-600 hover:text-blue-800 font-medium transition"
            >
              Marketplace
            </Link>
            <Link
              to="/sell"
              className="text-green-600 hover:text-green-800 font-medium transition"
            >
              Sell Product
            </Link>
            {user && (
              <Link
                to="/my-products"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition"
              >
                My Products
              </Link>
            )}
            {user ? (
              <ProfileDropdown user={user} />
            ) : (
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Products</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500">You have not listed any products yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
                <Link to={`/product/${product._id}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    <ImageGallery images={product.imageUrls || [product.imageUrl]} productName={product.name} compact={true} />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium z-10">
                      ₹{product.price}
                    </div>
                    {product.avgRating && (
                      <div className="absolute bottom-2 left-2 bg-white/80 rounded px-2 py-1 flex items-center gap-1 text-yellow-500 text-xs font-semibold shadow">
                        {product.avgRating.toFixed(1)}
                        <FaStar />
                        <span className="text-gray-500 ml-1">({product.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <Link to={`/product/${product._id}`} className="block">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition">{product.name}</h4>
                  </Link>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-600 font-bold text-lg">₹{product.price}</span>
                    <span className="text-gray-400 text-xs">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Link
                      to={`/product/${product._id}`}
                      className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts; 