import { useEffect } from 'react';

export default function SuccessModal({ isOpen, onRedirect, message }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Success Icon */}
        <div className="bg-gradient-to-br from-green-400 to-green-500 p-12 text-center">
          <div className="text-7xl font-bold text-white drop-shadow-lg">✓</div>
        </div>

        {/* Content */}
        <div className="p-10 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Success!</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">{message}</p>

          {/* Confirmation Details */}
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
            <p className="text-sm text-gray-600 mb-2">Your rental is confirmed</p>
            <p className="text-2xl font-bold text-green-600">🎉 Booking Confirmed!</p>
          </div>

          {/* Action Button */}
          <button
            onClick={onRedirect}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}