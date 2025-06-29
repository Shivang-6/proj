import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccessModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully.
          </p>

          {/* Transaction Details */}
          {transaction && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{transaction.product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-green-600">₹{transaction.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">What's Next?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Contact the seller to arrange pickup</li>
              <li>• Check your purchase history for updates</li>
              <li>• Rate your experience after receiving the item</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/history"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center"
            >
              View Purchase History
            </Link>
            
            <Link
              to="/landing"
              className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition text-center"
            >
              Continue Shopping
            </Link>
            
            <button
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal; 