import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ImageGallery from "../components/ImageGallery.jsx";
import EditProductModal from "../components/EditProductModal.jsx";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal.jsx";
import { FaStar } from 'react-icons/fa';
import ProductCard from '../components/ProductCard.jsx';

const MyProducts = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState({
    isOpen: false,
    product: null
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null
  });

  // Fetch user first
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/login/success`, { 
          withCredentials: true 
        });
        setUser(res.data.user);
      } catch (err) {
        console.log("Not logged in", err);
        setUser(null);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch user's products
  useEffect(() => {
    if (!user) return;
    
    const fetchMyProducts = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Use the correct API endpoint for seller's products
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/seller/${user._id}`, 
          { withCredentials: true }
        );
        
        if (res.data.success) {
          setProducts(res.data.products);
        } else {
          setError("Failed to fetch your products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load your products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, [user]);

  const handleEdit = (product) => {
    setEditModal({
      isOpen: true,
      product: product
    });
  };

  const handleDelete = (product) => {
    setDeleteModal({
      isOpen: true,
      product: product
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      product: null
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      product: null
    });
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
  };

  const handleProductDeleted = (productId) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product._id !== productId)
    );
  };

  const handleRelist = async (productId) => {
    try {
      const quantity = prompt("Enter quantity to re-list:");
      if (!quantity || quantity < 1) return;

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/products/${productId}/relist`,
        { quantity: parseInt(quantity) },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Update the product in the local state
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product._id === productId ? res.data.product : product
          )
        );
        alert("Product re-listed successfully!");
      }
    } catch (err) {
      console.error("Error re-listing product:", err);
      alert("Failed to re-list product");
    }
  };

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
          <Link to="/sell">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Add New Product
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-700">Loading your products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Products Listed Yet</h2>
              <p className="text-gray-700 mb-6">You haven't listed any products yet. Start selling now!</p>
              <Link to="/sell">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                  List Your First Product
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src={product.imageUrls?.[0] || product.imageUrl || 'https://placehold.co/300x200?text=Product+Image'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.quantity > 0 ? 'Available' : 'Sold Out'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-blue-600">₹{product.price}</span>
                    <span className="text-sm text-gray-700">Qty: {product.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-700 mb-3">
                    <span className="capitalize">{product.category}</span>
                    <span className="capitalize">{product.condition}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                    {product.quantity === 0 && (
                      <button
                        onClick={() => handleRelist(product._id)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition"
                      >
                        Re-list
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        product={editModal.product}
        onProductUpdated={handleProductUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        product={deleteModal.product}
        onProductDeleted={handleProductDeleted}
      />
    </div>
  );
};

export default MyProducts;