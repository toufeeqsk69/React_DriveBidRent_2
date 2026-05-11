import { useEffect } from 'react';

export default function ProcessingModal({ isOpen }) {
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
        <div className="p-12 text-center">
          {/* Spinner */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>

          {/* Content */}
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Processing Payment</h3>
          <p className="text-gray-600 text-lg">Please wait while we secure your booking...</p>

          {/* Loading text */}
          <div className="mt-8 flex justify-center gap-1">
            <span className="text-2xl text-orange-500 animate-bounce">.</span>
            <span className="text-2xl text-orange-500 animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="text-2xl text-orange-500 animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}