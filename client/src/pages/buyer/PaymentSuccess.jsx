import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPaymentSession, bookRental, completeAuctionPayment } from '../../services/buyer.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyAndComplete = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setStatus('error');
        setMessage('Invalid payment session.');
        return;
      }

      try {
        const verifyResult = await verifyPaymentSession(sessionId);
        
        if (verifyResult.success && verifyResult.session.payment_status === 'paid') {
          const metadata = verifyResult.session.metadata;
          
          if (metadata.type === 'rental') {
            // Reconstruct bookingData from metadata
            const bookingData = {
              rentalCarId: metadata.rentalCarId,
              sellerId: metadata.sellerId,
              pickupDate: metadata.pickupDate,
              dropDate: metadata.dropDate,
              totalCost: Number(metadata.totalCost),
              includeDriver: metadata.includeDriver === 'true'
            };
            
            // Execute the actual booking
            const bookResult = await bookRental(bookingData);
            if (bookResult.success) {
              setStatus('success');
              setMessage('Payment successful! Your rental is booked.');
              setTimeout(() => navigate('/buyer/purchases'), 3000);
            } else {
              throw new Error(bookResult.message || 'Booking creation failed after payment');
            }
          } else if (metadata.type === 'auction') {
            const purchaseResult = await completeAuctionPayment(metadata.purchaseId, 'stripe');
            if (purchaseResult.success) {
              setStatus('success');
              setMessage('Payment successful! Your purchase is complete.');
              setTimeout(() => navigate('/buyer/purchases'), 3000);
            } else {
              throw new Error(purchaseResult.message || 'Purchase completion failed after payment');
            }
          } else {
            setStatus('success');
            setMessage('Payment successful! Redirecting...');
            setTimeout(() => navigate('/buyer/dashboard'), 3000);
          }
        } else {
          setStatus('error');
          setMessage('Payment could not be verified. It may have failed or been canceled.');
        }
      } catch (error) {
        console.error('Error completing payment action:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred while confirming your order.');
      }
    };

    verifyAndComplete();
  }, [searchParams, navigate]);

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <h2 className="mt-4 text-xl font-semibold text-gray-700">{message}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-md text-center">
      {status === 'success' ? (
        <div className="text-green-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ) : (
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
      <h2 className={`text-2xl font-bold mb-2 ${status === 'success' ? 'text-gray-900' : 'text-red-600'}`}>
        {status === 'success' ? 'Payment Successful' : 'Payment Failed'}
      </h2>
      <p className="text-gray-600 mb-8">{message}</p>
      
      {status === 'error' && (
        <button
          onClick={() => navigate(-1)} // go back
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Try Again
        </button>
      )}
      {status === 'success' && (
        <button
          onClick={() => navigate('/buyer/purchases')}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Go to My Purchases
        </button>
      )}
    </div>
  );
}
