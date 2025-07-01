import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import ImageGallery from "../components/ImageGallery.jsx";

const PurchaseHistory = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/login/success`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch((err) => {
        console.log("Not logged in", err);
        window.location.href = "/login";
      });
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");
        let endpoint = `${import.meta.env.VITE_API_URL}/transactions/all`;
        
        if (activeTab === "purchases") {
          endpoint = `${import.meta.env.VITE_API_URL}/transactions/purchases`;
        } else if (activeTab === "sales") {
          endpoint = `${import.meta.env.VITE_API_URL}/transactions/sales`;
        }

        console.log("Fetching transactions from:", endpoint);
        const response = await axios.get(endpoint, { withCredentials: true });
        
        console.log("Transaction response:", response.data);
        
        if (response.data.success) {
          // Handle different response structures
          let transactionData = [];
          
          if (activeTab === "purchases" && response.data.purchases) {
            transactionData = response.data.purchases;
          } else if (activeTab === "sales" && response.data.sales) {
            transactionData = response.data.sales;
          } else if (response.data.transactions) {
            transactionData = response.data.transactions;
          } else if (response.data[activeTab]) {
            transactionData = response.data[activeTab];
          }
          
          console.log("Setting transactions:", transactionData);
          
          // Ensure transactionData is an array
          if (!Array.isArray(transactionData)) {
            console.warn("Transaction data is not an array:", transactionData);
            transactionData = [];
          }
          
          setTransactions(transactionData);
        } else {
          console.error("API returned success: false", response.data);
          setError(response.data.message || "Failed to fetch transactions");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        console.error("Error details:", err.response?.data);
        setError(err.response?.data?.message || "Failed to load transactions. Please try again.");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user, activeTab]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const renderTransaction = (transaction) => {
    // Add safety checks for transaction data
    if (!transaction) {
      console.warn("Transaction is null or undefined");
      return null;
    }

    // Handle cases where product might not be populated
    if (!transaction.product) {
      console.warn("Transaction missing product data:", transaction);
      return (
        <div key={transaction._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">
                Product Unavailable
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                This product may have been removed or is no longer available.
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Price:</span> ₹{transaction.price || 0}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Date:</span> {formatDate(transaction.transactionDate)}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'completed' || transaction.status === 'payment_completed' 
                      ? 'bg-green-100 text-green-800'
                      : transaction.status === 'payment_failed'
                      ? 'bg-red-100 text-red-800'
                      : transaction.status === 'payment_initiated'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(transaction.status || 'pending').replace('_', ' ').toUpperCase()}
                  </span>
                </p>
                {transaction.paymentMethod && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Payment:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.paymentMethod === 'razorpay' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.paymentMethod.toUpperCase()}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={transaction._id}
        to={`/product/${transaction.product._id}`}
        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition block"
      >
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden">
            <ImageGallery 
              images={transaction.product.imageUrls || [transaction.product.imageUrl]} 
              productName={transaction.product.name || 'Product'}
              compact={true}
            />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition">
              {transaction.product.name || 'Unknown Product'}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {transaction.product.description || 'No description available'}
            </p>
            
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Price:</span> ₹{transaction.price || 0}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Date:</span> {formatDate(transaction.transactionDate)}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.status === 'completed' || transaction.status === 'payment_completed' 
                    ? 'bg-green-100 text-green-800'
                    : transaction.status === 'payment_failed'
                    ? 'bg-red-100 text-red-800'
                    : transaction.status === 'payment_initiated'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {(transaction.status || 'pending').replace('_', ' ').toUpperCase()}
                </span>
              </p>
              {transaction.paymentMethod && (
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Payment:</span> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.paymentMethod === 'razorpay' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.paymentMethod.toUpperCase()}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/landing" className="text-2xl font-bold text-blue-600">
            CampusKart
          </Link>
          <nav className="flex gap-4 items-center">
            <Link
              to="/sell"
              className="text-green-600 hover:text-green-800 font-medium transition"
            >
              Sell Product
            </Link>
            <Link
              to="/landing"
              className="text-blue-600 hover:text-blue-800 font-medium transition"
            >
              Marketplace
            </Link>
            {user && <ProfileDropdown user={user} />}
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Transaction History</h1>
            <p className="text-gray-600">Track your purchases and sales</p>
          </div>

          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === "all"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All Transactions
              </button>
              <button
                onClick={() => setActiveTab("purchases")}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === "purchases"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Purchases
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === "sales"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Sales
              </button>
            </div>
          </div>

          <div className="p-6">
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg mb-2">⚠️</div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map(renderTransaction).filter(Boolean)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg mb-4">No transactions found.</p>
                <p className="text-gray-400 text-sm mb-4">
                  {activeTab === "purchases" && "You haven't made any purchases yet."}
                  {activeTab === "sales" && "You haven't sold any products yet."}
                  {activeTab === "all" && "No transaction history available."}
                </p>
                <div className="space-y-3">
                  <Link to="/landing">
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
                      Browse Marketplace
                    </button>
                  </Link>
                  <div className="text-xs text-gray-400">
                    <p>Debug: Active tab: {activeTab}</p>
                    <p>User ID: {user?._id}</p>
                    <p>Transactions count: {transactions.length}</p>
                    <button 
                      onClick={async () => {
                        try {
                          const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/debug/user-transactions`, { withCredentials: true });
                          console.log('Debug response:', response.data);
                          alert(`Debug: Found ${response.data.transactionCount} transactions. Check console for details.`);
                        } catch (err) {
                          console.error('Debug error:', err);
                          alert('Debug failed: ' + err.message);
                        }
                      }}
                      className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                    >
                      Debug API
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory; 