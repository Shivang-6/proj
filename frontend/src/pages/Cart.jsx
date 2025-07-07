import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { FaTrash, FaArrowLeft, FaShoppingBag, FaCreditCard } from 'react-icons/fa';
import { CartPaymentModal } from '../components/PaymentModal.jsx';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemCount 
  } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCartPayment, setShowCartPayment] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user info for payment prefill
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/success`, { credentials: 'include' });
        const data = await res.json();
        setUser(data.user);
      } catch {}
    })();
  }, []);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
              <FaShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. Start shopping to discover amazing deals!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="btn btn-primary text-lg px-8 py-4">
                <FaArrowLeft className="w-5 h-5" />
                Continue Shopping
              </Link>
              <Link to="/sell" className="btn btn-success text-lg px-8 py-4">
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="btn btn-ghost">
              <FaArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
              <p className="text-gray-600">{getCartItemCount()} items in your cart</p>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="btn btn-danger"
          >
            <FaTrash className="w-4 h-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Cart Items</h2>
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="card p-6 hover:shadow-medium transition-all duration-200">
                    <div className="flex items-start space-x-6">
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={item.imageUrls?.[0] || item.imageUrl || 'https://placehold.co/120x120?text=Product'}
                          alt={item.name}
                          className="w-24 h-24 rounded-xl object-cover shadow-soft"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/120x120?text=No+Image';
                          }}
                        />
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                        >
                          ×
                        </button>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {item.description}
                            </p>
                            {item.seller && (
                              <div className="flex items-center space-x-2 mb-3">
                                <img
                                  src={item.seller.profilePicture || 'https://placehold.co/24x24?text=U'}
                                  alt={item.seller.displayName || item.seller.name}
                                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                />
                                <span className="text-sm text-gray-500">
                                  Sold by {item.seller.displayName || item.seller.name}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xl font-bold text-green-600">
                              ₹{item.price}
                            </p>
                            <p className="text-sm text-gray-500">per item</p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">Quantity:</span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-semibold transition-colors"
                              >
                                -
                              </button>
                              <span className="text-lg font-semibold w-12 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-semibold transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">
                              ₹{item.price * item.quantity}
                            </p>
                            <p className="text-sm text-gray-500">Total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getCartItemCount()} items)</span>
                  <span>₹{getCartTotal()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-gradient">₹{getCartTotal()}</span>
                </div>
              </div>

              <button
                className="w-full btn btn-primary text-lg py-4 mt-4"
                onClick={() => setShowCartPayment(true)}
                disabled={cartItems.length === 0}
              >
                <FaCreditCard className="w-5 h-5" />
                Buy All (Pay ₹{getCartTotal()})
              </button>

              <CartPaymentModal
                isOpen={showCartPayment}
                onClose={() => setShowCartPayment(false)}
                cartItems={cartItems}
                user={user}
                onPaymentSuccess={() => {
                  clearCart();
                  setShowCartPayment(false);
                  navigate('/payment-success');
                }}
              />

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Secure checkout powered by</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">R</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Razorpay</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-2">What's included?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Secure payment processing</li>
                  <li>• Buyer protection</li>
                  <li>• Local pickup arrangement</li>
                  <li>• Direct seller communication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping Section */}
        <div className="mt-12 text-center">
          <div className="card p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Not done shopping?</h3>
            <p className="text-gray-600 mb-6">Discover more amazing products from your campus community</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="btn btn-secondary text-lg px-8 py-4">
                Continue Shopping
              </Link>
              <Link to="/sell" className="btn btn-success text-lg px-8 py-4">
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 