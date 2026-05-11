// client/src/pages/buyer/RentalDetails.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRentalById, createOrGetChatForRental, addReview, getReviews, checkCanReview, createCheckoutSession } from '../../services/buyer.services';
import DatePickerModal from './components/modals/DatePickerModal';
import PaymentModal from './components/modals/PaymentModal';
import ProcessingModal from './components/modals/ProcessingModal';
import SuccessModal from './components/modals/SuccessModal';
import ReviewModal from './components/modals/ReviewModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RentalDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDateModal, setShowDateModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showProcessingModal, setShowProcessingModal] = useState(false);
    const [showSuccessModal, _setShowSuccessModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [canReview, setCanReview] = useState(false);

    const [pickupDate, setPickupDate] = useState("");
    const [dropDate, setDropDate] = useState("");
    const [includeDriver, setIncludeDriver] = useState(false);
    const [totalCost, setTotalCost] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");

    useEffect(() => {
        fetchRentalDetails();
        fetchReviews();
        checkReviewEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchRentalDetails = async () => {
        try {
            setLoading(true);
            const data = await getRentalById(id);
            setRental(data);
        } catch (error) {
            console.error("Error fetching rental details:", error);
            setError("Failed to load rental details");
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const reviewsData = await getReviews(id);
            setReviews(reviewsData);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const checkReviewEligibility = async () => {
        try {
            const eligibility = await checkCanReview(id);
            setCanReview(eligibility.canReview);
        } catch (error) {
            console.error("Error checking review eligibility:", error);
        }
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            await addReview(id, reviewData);
            await fetchReviews();
            await checkReviewEligibility();
            alert("Review submitted successfully!");
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to submit review");
        }
    };

    const handleDateSelect = (pickup, drop, driverIncluded) => {
        setPickupDate(pickup);
        setDropDate(drop);
        setIncludeDriver(driverIncluded);

        if (pickup && drop && rental) {
            const days = Math.ceil((new Date(drop) - new Date(pickup)) / (1000 * 60 * 60 * 24));
            const baseCost = days * (rental.costPerDay ?? 0);
            const driverCost = driverIncluded && rental.driverAvailable ? days * rental.driverRate : 0;
            setTotalCost(baseCost + driverCost);
        }
    };

    const handleRentNow = () => {
        if (rental?.status !== "available") return;
        if (!pickupDate || !dropDate) return alert("Please select both pickup and drop dates.");
        if (totalCost <= 0) return alert("Invalid rental period.");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(pickupDate) < today) return alert("Pickup date cannot be in the past.");
        if (new Date(dropDate) <= new Date(pickupDate)) return alert("Drop date must be after pickup date.");

        setShowDateModal(false);
        const scrollToCenter = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const centerPosition = (scrollHeight - clientHeight) / 2;
            window.scrollTo({ top: centerPosition, behavior: 'smooth' });
        };
        scrollToCenter();
        setTimeout(() => setShowPaymentModal(true), 300);
    };

    const handlePayment = async (_paymentMethod) => {
        setShowPaymentModal(false);
        setShowProcessingModal(true);

        try {
            const sessionData = await createCheckoutSession({
                amount: totalCost,
                productName: `Rental: ${rental.vehicleName}`,
                metadata: {
                    type: 'rental',
                    rentalCarId: id,
                    sellerId: rental.seller._id,
                    pickupDate: pickupDate,
                    dropDate: dropDate,
                    totalCost: totalCost.toString(),
                    includeDriver: includeDriver ? 'true' : 'false'
                },
                successUrl: `${window.location.origin}/buyer/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/buyer/payment-cancel`
            });

            if (sessionData.success && sessionData.url) {
                window.location.href = sessionData.url;
            } else {
                throw new Error(sessionData.message || 'Failed to initialize payment');
            }
        } catch (error) {
            console.error('Booking/Payment error:', error);
            setShowProcessingModal(false);
            alert('Payment initialization failed. Please try again.');
        }
    };

    const originPath = location.state?.from || "/buyer/rentals";
    const originLabel = useMemo(() => {
        const labels = {
            "/buyer": "Dashboard",
            "/buyer/rentals": "Rentals",
            "/buyer/purchases": "Purchases",
            "/buyer/wishlist": "Wishlist"
        };
        return labels[originPath] || "Back";
    }, [originPath]);

    const isAvailable = rental?.status === "available";

    const redirectToDashboard = () => navigate("/buyer");
    const redirectBack = () => navigate(originPath);

    if (loading) return <LoadingSpinner />;

    if (error || !rental) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-3xl text-orange-500">!</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{error || "Rental Not Found"}</h2>
                    <p className="text-gray-600 mb-8">We couldn't find the rental you're looking for.</p>
                    <button
                        onClick={redirectBack}
                        className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition shadow-md"
                    >
                        Return to {originLabel}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Navigation */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={redirectBack}
                        className="text-gray-600 hover:text-orange-600 font-medium flex items-center gap-2 transition-colors group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to {originLabel}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Vehicle Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{rental.vehicleName}</h1>
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="text-3xl font-bold text-orange-600">₹{rental.costPerDay}<span className="text-base font-normal text-gray-600">/day</span></span>
                                {!isAvailable && (
                                    <span className="px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-semibold shadow-sm">
                                        Currently Unavailable
                                    </span>
                                )}
                            </div>
                        </div>
                        {isAvailable && (
                            <button
                                onClick={() => {
                                    const scrollToCenter = () => {
                                        const scrollHeight = document.documentElement.scrollHeight;
                                        const clientHeight = document.documentElement.clientHeight;
                                        const centerPosition = (scrollHeight - clientHeight) / 2;
                                        window.scrollTo({ top: centerPosition, behavior: 'smooth' });
                                    };
                                    scrollToCenter();
                                    setTimeout(() => setShowDateModal(true), 300);
                                }}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Rent Now
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Vehicle Image */}
                        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                            <img
                                src={rental.vehicleImage}
                                alt={rental.vehicleName}
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        {/* Specifications */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-xl border border-orange-100">
                                    <p className="text-sm text-gray-600 mb-1.5 font-medium">Year</p>
                                    <p className="font-bold text-gray-900 text-lg">{rental.year}</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-xl border border-orange-100">
                                    <p className="text-sm text-gray-600 mb-1.5 font-medium">Seating Capacity</p>
                                    <p className="font-bold text-gray-900 text-lg">{rental.capacity} seats</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-xl border border-orange-100">
                                    <p className="text-sm text-gray-600 mb-1.5 font-medium">Fuel Type</p>
                                    <p className="font-bold text-gray-900 text-lg capitalize">{rental.fuelType}</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-xl border border-orange-100">
                                    <p className="text-sm text-gray-600 mb-1.5 font-medium">Transmission</p>
                                    <p className="font-bold text-gray-900 text-lg capitalize">{rental.transmission}</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-xl border border-orange-100">
                                    <p className="text-sm text-gray-600 mb-1.5 font-medium">Air Conditioning</p>
                                    <p className={`font-bold text-lg ${rental.AC === 'available' ? 'text-green-600' : 'text-gray-900'}`}>
                                        {rental.AC === 'available' ? 'Available' : 'Not Available'}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-xl border border-orange-100">
                                    <p className="text-sm text-gray-600 mb-1.5 font-medium">Driver Service</p>
                                    <p className={`font-bold text-lg ${rental.driverAvailable ? 'text-green-600' : 'text-gray-900'}`}>
                                        {rental.driverAvailable ? 'Available' : 'Not Available'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                                {canReview && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="text-orange-600 hover:text-white hover:bg-orange-600 font-semibold border-2 border-orange-600 px-5 py-2.5 rounded-xl transition-all"
                                    >
                                        Write a Review
                                    </button>
                                )}
                            </div>

                            {reviews.length === 0 ? (
                                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-gray-400 text-3xl">★</span>
                                    </div>
                                    <p className="text-gray-700 font-semibold mb-2 text-lg">No reviews yet</p>
                                    <p className="text-gray-500 text-sm">Be the first to share your experience</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <p className="font-bold text-gray-900 mb-2 text-lg">
                                                        {review.buyerId?.firstName} {review.buyerId?.lastName}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`text-xl ${i < review.rating ? 'text-orange-500' : 'text-gray-300'}`}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500 font-medium">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Seller Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Host Information</h2>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white">
                                            {rental.seller.firstName?.charAt(0)}{rental.seller.lastName?.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{rental.seller.firstName} {rental.seller.lastName}</p>
                                        <p className="text-gray-600 text-sm flex items-center gap-1">
                                            {rental.seller.city}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">Email Address</p>
                                        <p className="text-gray-900 font-medium">{rental.seller.email}</p>
                                    </div>
                                    {rental.seller.phone && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">Phone Number</p>
                                            <p className="text-gray-900 font-medium">{rental.seller.phone}</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={async () => {
                                        try {
                                            const chat = await createOrGetChatForRental(id);
                                            if (chat && chat._id) {
                                                navigate(`/buyer/chats/${chat._id}`);
                                            } else {
                                                alert('Unable to open chat with seller. Please try again later.');
                                            }
                                        } catch (err) {
                                            console.error('Contact seller (rental) error:', err);
                                            alert('Unable to open chat.');
                                        }
                                    }}
                                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3.5 rounded-xl font-semibold hover:from-gray-900 hover:to-black transition-all flex items-center justify-center gap-2"
                                >
                                    Contact Host
                                </button>
                            </div>
                        </div>

                        {/* Quick Facts */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Car Rental Details</h2>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Daily Rate</span>
                                    <span className="font-bold text-gray-900 text-lg">₹{rental.costPerDay}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Driver Available</span>
                                    <span className={`font-bold text-lg ${rental.driverAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                        {rental.driverAvailable ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                {rental.driverAvailable && (
                                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Driver Rate</span>
                                        <span className="font-bold text-gray-900 text-lg">₹{rental.driverRate}/day</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center py-4">
                                    <span className="text-gray-600 font-medium">Vehicle Status</span>
                                    <span className={`font-bold text-lg ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                        {isAvailable ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </div>

                            {isAvailable && (
                                <button
                                    onClick={() => {
                                        const scrollToCenter = () => {
                                            const scrollHeight = document.documentElement.scrollHeight;
                                            const clientHeight = document.documentElement.clientHeight;
                                            const centerPosition = (scrollHeight - clientHeight) / 2;
                                            window.scrollTo({ top: centerPosition, behavior: 'smooth' });
                                        };
                                        scrollToCenter();
                                        setTimeout(() => setShowDateModal(true), 300);
                                    }}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all mt-6"
                                >
                                    Book This Vehicle
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <DatePickerModal
                isOpen={showDateModal}
                onClose={() => setShowDateModal(false)}
                onProceed={handleRentNow}
                onDateSelect={handleDateSelect}
                rental={rental}
            />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onProcessPayment={handlePayment}
                totalCost={totalCost}
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodSelect={setSelectedPaymentMethod}
            />

            <ProcessingModal isOpen={showProcessingModal} />

            <SuccessModal
                isOpen={showSuccessModal}
                onRedirect={redirectToDashboard}
                message="Rental booked successfully!"
            />

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSubmit={handleSubmitReview}
                rentalName={rental?.vehicleName}
            />
        </div>
    );
}