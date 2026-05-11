import { useState, useEffect } from 'react';

export default function PaymentModal({
    isOpen,
    onClose,
    onProcessPayment,
    totalCost,
    selectedPaymentMethod,
    onPaymentMethodSelect
}) {
    const [paymentMethod, setPaymentMethod] = useState(selectedPaymentMethod || 'upi');

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

    const _handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
        onPaymentMethodSelect(method);
    };

    const handlePayment = () => {
        onProcessPayment(paymentMethod);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-24">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-white">
                    <h2 className="text-xl font-bold">Complete Payment</h2>
                    <p className="text-orange-100 text-sm mt-1">Select your payment method</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Total Amount */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Total Amount Due</p>
                        <h3 className="text-2xl font-bold text-orange-600 mt-1">₹{totalCost.toLocaleString()}</h3>
                    </div>

                    {/* Payment Info */}
                    <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center gap-3">
                            <div className="text-blue-500 text-2xl">🔒</div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">Secure Payment</h4>
                                <p className="text-gray-600 text-xs mt-1">You will be securely redirected to Stripe for completing this payment.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm"
                    >
                        Pay ₹{totalCost.toLocaleString()}
                    </button>
                </div>
            </div>
        </div>
    );
}