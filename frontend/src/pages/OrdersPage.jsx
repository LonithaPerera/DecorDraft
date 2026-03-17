import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
    Package, 
    Truck, 
    CheckCircle2, 
    Clock, 
    ChevronRight, 
    ShoppingBag, 
    MapPin, 
    CreditCard,
    ArrowLeft,
    Search,
    Star,
    X,
    MessageSquare,
    Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ReviewModal = ({ item, orderId, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, {
                productId: item.product,
                orderId,
                rating,
                comment
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="relative h-32 bg-[#111827] flex items-center justify-center">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Product Feedback</p>
                        <h3 className="text-xl font-black text-white font-serif tracking-tight">Write a Review</h3>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <div className="flex items-center gap-6 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm shrink-0">
                            <img src={item.imageUrl?.startsWith('/') ? `${import.meta.env.VITE_API_URL}${item.imageUrl}` : item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-gray-900">{item.name}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Ordered on {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">How would you rate it?</label>
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        className="p-1 transition-transform hover:scale-125 active:scale-90"
                                    >
                                        <Star 
                                            className={`w-10 h-10 transition-colors ${ (hover || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-200' }`} 
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs font-black text-[#A85517] uppercase tracking-widest pt-1">
                                {rating === 5 ? 'Excellent' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Share your experience</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What did you like or dislike? How's the quality?"
                                className="w-full bg-gray-50 border border-gray-100 rounded-[24px] p-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all min-h-[120px] resize-none"
                            />
                        </div>

                        {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#111827] text-white py-5 rounded-[22px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-900/10 hover:bg-[#A85517] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <>Submit Review <Check className="w-5 h-5" /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const OrdersPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviewItem, setReviewItem] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/my-orders`);
            setOrders(res.data);
            // Update selected order reference to get latest review status if needed
            if (selectedOrder) {
                const updated = res.data.find(o => o._id === selectedOrder._id);
                if (updated) setSelectedOrder(updated);
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusStep = (status) => {
        switch (status) {
            case 'Pending': return 1;
            case 'Processing': return 2;
            case 'Shipped': return 3;
            case 'Delivered': return 4;
            case 'Cancelled': return 0;
            default: return 1;
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            Pending: 'bg-orange-50 text-orange-600 border-orange-100',
            Processing: 'bg-blue-50 text-blue-600 border-blue-100',
            Shipped: 'bg-purple-50 text-purple-600 border-purple-100',
            Delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            Cancelled: 'bg-red-50 text-red-600 border-red-100'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[status] || colors.Pending}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center bg-[#F9FAFB]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#A85517] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#F9FAFB]">
            <div className="container mx-auto px-6 max-w-6xl">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 font-serif tracking-tight">Your Orders</h1>
                        <p className="text-gray-500 mt-2 font-medium">Track your furniture's journey from our workshop to your home.</p>
                    </div>
                    <Link to="/store" className="flex items-center gap-2 text-[#A85517] font-black text-xs uppercase tracking-[0.2em] hover:brightness-75 transition-all group">
                        <ShoppingBag className="w-4 h-4" /> Continue Shopping
                    </Link>
                </div>

                {successMsg && (
                    <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-between text-sm font-black uppercase animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5" /> {successMsg}
                        </div>
                        <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-sm">
                        <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Package className="w-10 h-10 text-[#A85517]" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 font-serif">No orders yet</h2>
                        <p className="text-gray-500 max-w-sm mx-auto mb-10 font-medium">When you place an order, it will appear here so you can track its progress.</p>
                        <Link to="/store" className="bg-[#111827] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#A85517] transition-all shadow-xl shadow-gray-900/10">Start Exploring</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* Orders List */}
                        <div className="lg:col-span-1 space-y-4">
                            {orders.map((order) => (
                                <button
                                    key={order._id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`w-full text-left p-6 rounded-[32px] border transition-all duration-300 ${selectedOrder?._id === order._id ? 'bg-white border-[#A85517] shadow-xl shadow-orange-900/5 ring-1 ring-[#A85517]' : 'bg-white/50 border-gray-100 hover:bg-white hover:border-gray-200 shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                                            <p className="text-xs font-mono font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                            <p className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                            <p className="text-lg font-black text-[#A85517]">${order.total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Order Details & Tracking */}
                        <div className="lg:col-span-2">
                            {selectedOrder ? (
                                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                                    {/* Tracking Header */}
                                    <div className="bg-[#111827] p-8 md:p-12 text-white overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full blur-3xl" />
                                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Track Shipment</p>
                                                <h3 className="text-3xl font-black font-serif">#{selectedOrder._id.slice(-8).toUpperCase()}</h3>
                                                <p className="text-white/60 text-xs font-bold mt-2 flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5" /> Order placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Current Status</p>
                                                <span className="text-xl font-black text-[#A85517] uppercase tracking-tighter">{selectedOrder.status}</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {selectedOrder.status !== 'Cancelled' && (
                                            <div className="mt-12 relative">
                                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[#A85517] transition-all duration-1000 ease-out"
                                                        style={{ width: `${(getStatusStep(selectedOrder.status) / 4) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-6">
                                                    {[
                                                        { label: 'Placed', icon: Package, step: 1 },
                                                        { label: 'Processing', icon: Search, step: 2 },
                                                        { label: 'Shipped', icon: Truck, step: 3 },
                                                        { label: 'Delivered', icon: CheckCircle2, step: 4 }
                                                    ].map((item) => (
                                                        <div key={item.label} className={`flex flex-col items-center gap-2 group`}>
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${getStatusStep(selectedOrder.status) >= item.step ? 'bg-[#A85517] text-white shadow-lg shadow-orange-900/50 scale-110' : 'bg-white/10 text-white/30'}`}>
                                                                <item.icon className="w-4 h-4" />
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${getStatusStep(selectedOrder.status) >= item.step ? 'text-white' : 'text-white/20'}`}>
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Details Body */}
                                    <div className="p-8 md:p-12 space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            {/* Delivery Address */}
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" /> Delivery Destination
                                                </h4>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-gray-900">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                                                    <p className="text-sm font-bold text-gray-500">{selectedOrder.shippingAddress.address}</p>
                                                    <p className="text-sm font-bold text-gray-500">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zipCode}</p>
                                                    <p className="text-sm font-bold text-gray-500">{selectedOrder.shippingAddress.email}</p>
                                                </div>
                                            </div>
                                            {/* Payment Summary */}
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" /> Billing Summary
                                                </h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm font-bold">
                                                        <span className="text-gray-400">Subtotal</span>
                                                        <span className="text-gray-900">${selectedOrder.subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm font-bold">
                                                        <span className="text-gray-400">Estimated Tax</span>
                                                        <span className="text-gray-900">${selectedOrder.tax.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm font-black pt-2 border-t border-gray-50">
                                                        <span className="text-gray-900">Total Charged</span>
                                                        <span className="text-[#A85517]">${selectedOrder.total.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items List */}
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Ordered Items ({selectedOrder.items.length})</h4>
                                            <div className="space-y-4">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-6 p-4 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                                                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                                            <img 
                                                                src={item.imageUrl?.startsWith('/') ? `${import.meta.env.VITE_API_URL}${item.imageUrl}` : item.imageUrl} 
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400'}
                                                            />
                                                        </div>
                                                        <div className="flex-grow flex justify-between items-center">
                                                            <div>
                                                                <h5 className="text-sm font-black text-gray-900">{item.name}</h5>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Qty: {item.quantity}</span>
                                                                    {item.selectedColor && (
                                                                        <div className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: item.selectedColor }} title={item.selectedColor} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <p className="text-sm font-black text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                                                                {selectedOrder.status === 'Delivered' && (
                                                                    <button 
                                                                        onClick={() => setReviewItem(item)}
                                                                        className="bg-white border-2 border-[#111827] text-[#111827] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#111827] hover:text-white transition-all shadow-sm"
                                                                    >
                                                                        Review Item
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/40 rounded-[40px] border-2 border-dashed border-gray-100 h-[600px] flex flex-col items-center justify-center text-center p-12">
                                    <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                                        <ArrowLeft className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2 font-serif">Select an order</h3>
                                    <p className="text-sm text-gray-400 max-w-xs font-medium">Choose an order from the list on the left to see detailed tracking information and item summaries.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewItem && (
                <ReviewModal 
                    item={reviewItem} 
                    orderId={selectedOrder._id}
                    onClose={() => setReviewItem(null)}
                    onSuccess={() => {
                        setSuccessMsg('Thank you for your feedback! Review submitted.');
                        fetchOrders();
                        setTimeout(() => setSuccessMsg(''), 5000);
                    }}
                />
            )}
        </div>
    );
};

export default OrdersPage;
