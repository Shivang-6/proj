import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentModal = ({ isOpen, onClose, product, user, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (isOpen && product) {
      createOrder();
    }
  }, [isOpen, product]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const createOrder = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post('http://localhost:5000/payment/create-order', {
        productId: product._id,
        sellerId: product.seller._id,
        price: product.price
      }, { withCredentials: true });

      if (response.data.success) {
        setOrderData(response.data);
      } else {
        setError(response.data.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!orderData) {
      setError('Order data not available');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const options = {
        key: 'rzp_test_zpvHrBMDaj817K',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'CampusKart',
        description: `Purchase: ${product.name}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            console.log('Payment response from Razorpay:', response);
            
            // Verify payment on backend
            const verifyResponse = await axios.post('http://localhost:5000/payment/verify-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              transactionId: orderData.transactionId
            }, { withCredentials: true });

            console.log('Payment verification response:', verifyResponse.data);

            if (verifyResponse.data.success) {
              console.log('Payment successful, calling onPaymentSuccess with:', verifyResponse.data.transaction);
              onPaymentSuccess(verifyResponse.data.transaction);
              onClose();
            } else {
              console.error('Payment verification failed:', verifyResponse.data.message);
              setError(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Error verifying payment:', err);
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: user?.displayName || user?.name || '',
          email: user?.email || '',
          contact: user?.phoneNumber || ''
        },
        notes: {
          address: 'CampusKart Purchase'
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            onClose();
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Error initiating payment:', err);
      setError('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Complete Purchase</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && !orderData ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Creating order...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={createOrder}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Product Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/64x64?text=No+Image';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  <p className="text-lg font-bold text-green-600 mt-1">₹{product.price}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Product Price:</span>
                <span className="font-medium">₹{product.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="font-medium">₹0</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">₹{product.price}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Payment Method</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">R</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Razorpay</p>
                    <p className="text-xs text-gray-600">Secure payment gateway</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay ₹{product.price}
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 Your payment is secured by Razorpay's 256-bit SSL encryption
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal; 