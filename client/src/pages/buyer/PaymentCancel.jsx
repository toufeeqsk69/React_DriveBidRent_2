import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-md text-center">
      <div className="text-orange-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
      <p className="text-gray-600 mb-8">
        Your payment was canceled. You have not been charged.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate('/buyer/dashboard')}
          className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate(-1)} // usually goes back to the payment modal trigger
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
