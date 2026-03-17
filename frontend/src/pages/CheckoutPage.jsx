import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronRight, 
    ArrowLeft, 
    ShieldCheck, 
    MapPin, 
    CreditCard, 
    CheckCircle2, 
    Truck, 
    Lock,
    Package,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useContext(AuthContext);
    const { cartItems, cartTotal, clearCart } = useCart();
    
    const [step, setStep] = useState(1); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ')[1] || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        country: 'United States',
        paymentMethod: 'card',
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const subtotal = cartTotal;
    const shipping = 0;
    const tax = cartTotal * 0.08;
    const total = subtotal + shipping + tax;

    // Redirect to login if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login?redirect=checkout');
        }
    }, [user, authLoading, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateShipping = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePayment = () => {
        const newErrors = {};
        if (formData.paymentMethod === 'card') {
            if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';
            if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
            else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Card number must be 16 digits';
            if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry is required';
            else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) newErrors.expiryDate = 'Use MM/YY format';
            if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
            else if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = 'CVV is invalid';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && validateShipping()) setStep(2);
        else if (step === 2 && validatePayment()) setStep(3);
    };
    
    const prevStep = () => setStep(step - 1);

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    selectedColor: item.selectedColor,
                    imageUrl: item.imageUrl
                })),
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    zipCode: formData.zipCode,
                    country: formData.country
                },
                paymentMethod: formData.paymentMethod,
                subtotal,
                tax,
                total
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/orders`, orderData);
            
            setStep(4); // Success step
            clearCart();
        } catch (err) {
            console.error('Order error:', err);
            setErrors({ submit: err.response?.data?.msg || 'Failed to place order. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><Loader2 className="w-12 h-12 text-[#A85517] animate-spin" /></div>;
    }

    if (cartItems.length === 0 && step < 4) {
        return (
            <div className="pt-32 pb-20 bg-[#F9FAFB] min-h-screen">
                <div className="container mx-auto px-6 text-center">
                    <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm max-w-xl mx-auto">
                        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-3xl font-black text-gray-900 mb-4 font-serif">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 font-medium">Add some beautiful pieces to your cart before checking out.</p>
                        <Link to="/store" className="bg-[#111827] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#A85517] transition-all inline-block">Go to Store</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 4) {
        return (
            <div className="pt-32 pb-20 bg-[#F9FAFB] min-h-screen">
                <div className="container mx-auto px-6 text-center">
                    <div className="bg-white p-16 rounded-[40px] border border-gray-100 shadow-xl max-w-2xl mx-auto animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-8" />
                        <h2 className="text-4xl font-black text-gray-900 mb-4 font-serif">Order Confirmed!</h2>
                        <p className="text-gray-500 mb-2 font-medium">Thank you for your purchase, {formData.firstName}.</p>
                        <p className="text-gray-400 text-sm mb-12">An email confirmation has been sent to {formData.email}. Your order is being processed and will be delivered within 5-7 business days.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/" className="bg-[#111827] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#A85517] transition-all">Back to Home</Link>
                            <Link to="/designs" className="bg-gray-50 text-gray-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">My Designs</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 bg-[#F9FAFB] min-h-screen">
            <div className="container mx-auto px-6 max-w-7xl">
                
                {/* Checkout Steps */}
                <div className="flex items-center justify-center mb-16 overflow-x-auto pb-4">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#A85517]' : 'text-gray-300'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= 1 ? 'bg-[#A85517] text-white ring-8 ring-orange-50' : 'bg-gray-100'}`}>1</div>
                            <span className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">Shipping Info</span>
                        </div>
                        <div className={`w-12 sm:w-20 h-0.5 transition-all ${step >= 2 ? 'bg-[#A85517]' : 'bg-gray-100'}`}></div>
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#A85517]' : 'text-gray-300'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= 2 ? 'bg-[#A85517] text-white ring-8 ring-orange-50' : 'bg-gray-100'}`}>2</div>
                            <span className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">Payment</span>
                        </div>
                        <div className={`w-12 sm:w-20 h-0.5 transition-all ${step >= 3 ? 'bg-[#A85517]' : 'bg-gray-100'}`}></div>
                        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#A85517]' : 'text-gray-300'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= 3 ? 'bg-[#A85517] text-white ring-8 ring-orange-50' : 'bg-gray-100'}`}>3</div>
                            <span className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">Review</span>
                        </div>
                    </div>
                </div>

                {errors.submit && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5" /> {errors.submit}
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Form Sections */}
                    <div className="flex-grow space-y-8 max-w-3xl">
                        
                        {/* Step 1: Shipping Address */}
                        {step === 1 && (
                            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="bg-orange-50 p-4 rounded-2xl">
                                        <MapPin className="w-6 h-6 text-[#A85517]" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 font-serif">Shipping Address</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">First Name</label>
                                        <input 
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className={`w-full bg-gray-50 border ${errors.firstName ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all`} 
                                        />
                                        {errors.firstName && <p className="text-[10px] font-bold text-red-500 px-1 uppercase tracking-tighter">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                                        <input 
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className={`w-full bg-gray-50 border ${errors.lastName ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all`} 
                                        />
                                        {errors.lastName && <p className="text-[10px] font-bold text-red-500 px-1 uppercase tracking-tighter">{errors.lastName}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                        <input 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            type="email" 
                                            className={`w-full bg-gray-50 border ${errors.email ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all`} 
                                        />
                                        {errors.email && <p className="text-[10px] font-bold text-red-500 px-1 uppercase tracking-tighter">{errors.email}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Street Address</label>
                                        <input 
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className={`w-full bg-gray-50 border ${errors.address ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all`} 
                                        />
                                        {errors.address && <p className="text-[10px] font-bold text-red-500 px-1 uppercase tracking-tighter">{errors.address}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">City</label>
                                        <input 
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className={`w-full bg-gray-50 border ${errors.city ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all`} 
                                        />
                                        {errors.city && <p className="text-[10px] font-bold text-red-500 px-1 uppercase tracking-tighter">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Zip Code</label>
                                        <input 
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className={`w-full bg-gray-50 border ${errors.zipCode ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all`} 
                                        />
                                        {errors.zipCode && <p className="text-[10px] font-bold text-red-500 px-1 uppercase tracking-tighter">{errors.zipCode}</p>}
                                    </div>
                                </div>

                                <button 
                                    onClick={nextStep}
                                    className="mt-12 w-full bg-[#111827] text-white py-5 rounded-[22px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-900/10 hover:bg-[#A85517] transition-all"
                                >
                                    Proceed to Payment
                                </button>
                            </div>
                        )}

                        {/* Step 2: Payment Selection */}
                        {step === 2 && (
                            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="bg-orange-50 p-4 rounded-2xl">
                                        <CreditCard className="w-6 h-6 text-[#A85517]" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 font-serif">Payment Method</h2>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <button 
                                        onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                                        className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${formData.paymentMethod === 'card' ? 'border-[#A85517] bg-orange-50/20 shadow-lg shadow-orange-900/5' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${formData.paymentMethod === 'card' ? 'bg-[#A85517] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Credit / Debit Card</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Safe & secure payments</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === 'card' ? 'border-[#A85517] ring-4 ring-orange-50' : 'border-gray-200'}`}>
                                            {formData.paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-[#A85517] rounded-full" />}
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => setFormData({...formData, paymentMethod: 'paypal'})}
                                        className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${formData.paymentMethod === 'paypal' ? 'border-[#A85517] bg-orange-50/20 shadow-lg shadow-orange-900/5' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${formData.paymentMethod === 'paypal' ? 'bg-[#A85517] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">PayPal</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Faster checkout with PayPal</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === 'paypal' ? 'border-[#A85517] ring-4 ring-orange-50' : 'border-gray-200'}`}>
                                            {formData.paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 bg-[#A85517] rounded-full" />}
                                        </div>
                                    </button>
                                </div>

                                {formData.paymentMethod === 'card' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Cardholder Name</label>
                                            <input 
                                                name="cardName"
                                                value={formData.cardName}
                                                onChange={handleInputChange}
                                                type="text" 
                                                className={`w-full bg-gray-50 border ${errors.cardName ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all`} 
                                            />
                                            {errors.cardName && <p className="text-[10px] font-bold text-red-500 px-1 tracking-tighter uppercase">{errors.cardName}</p>}
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Card Number</label>
                                            <input 
                                                name="cardNumber"
                                                value={formData.cardNumber}
                                                onChange={handleInputChange}
                                                placeholder="0000 0000 0000 0000"
                                                type="text" 
                                                maxLength="16"
                                                className={`w-full bg-gray-50 border ${errors.cardNumber ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all font-mono`} 
                                            />
                                            {errors.cardNumber && <p className="text-[10px] font-bold text-red-500 px-1 tracking-tighter uppercase">{errors.cardNumber}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Expiry Date</label>
                                            <input 
                                                name="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={handleInputChange}
                                                placeholder="MM/YY"
                                                type="text" 
                                                maxLength="5"
                                                className={`w-full bg-gray-50 border ${errors.expiryDate ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all`} 
                                            />
                                            {errors.expiryDate && <p className="text-[10px] font-bold text-red-500 px-1 tracking-tighter uppercase">{errors.expiryDate}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">CVV</label>
                                            <input 
                                                name="cvv"
                                                value={formData.cvv}
                                                onChange={handleInputChange}
                                                placeholder="***"
                                                type="password" 
                                                maxLength="4"
                                                className={`w-full bg-gray-50 border ${errors.cvv ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all`} 
                                            />
                                            {errors.cvv && <p className="text-[10px] font-bold text-red-500 px-1 tracking-tighter uppercase">{errors.cvv}</p>}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-12 flex gap-4">
                                    <button 
                                        onClick={prevStep}
                                        className="w-1/3 py-5 rounded-[22px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={nextStep}
                                        className="flex-grow bg-[#111827] text-white py-5 rounded-[22px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-900/10 hover:bg-[#A85517] transition-all"
                                    >
                                        Review Order
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review Order */}
                        {step === 3 && (
                            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="bg-orange-50 p-4 rounded-2xl">
                                        <Lock className="w-6 h-6 text-[#A85517]" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 font-serif">Final Review</h2>
                                </div>

                                <div className="space-y-10">
                                    {/* Shipping Summary */}
                                    <div className="flex justify-between items-start pb-8 border-b border-gray-50">
                                        <div className="flex gap-4">
                                            <div className="bg-gray-50 p-3.5 rounded-2xl h-fit">
                                                <MapPin className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivering to</p>
                                                <p className="text-sm font-black text-gray-900">{formData.firstName} {formData.lastName}</p>
                                                <p className="text-xs font-bold text-gray-500 mt-0.5">{formData.address}, {formData.city}, {formData.zipCode}</p>
                                                <p className="text-xs font-bold text-gray-500">{formData.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setStep(1)} className="text-[10px] font-black text-[#A85517] uppercase tracking-[0.2em] hover:brightness-75 transition-all border-b border-[#A85517]">Edit</button>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="flex justify-between items-start pb-8 border-b border-gray-50">
                                        <div className="flex gap-4">
                                            <div className="bg-gray-50 p-3.5 rounded-2xl h-fit">
                                                <CreditCard className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                                                <p className="text-sm font-black text-gray-900 uppercase">{formData.paymentMethod === 'card' ? 'Credit Card' : 'PayPal'}</p>
                                                {formData.paymentMethod === 'card' && (
                                                    <p className="text-xs font-bold text-gray-500 mt-0.5">Ends in •••• {formData.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => setStep(2)} className="text-[10px] font-black text-[#A85517] uppercase tracking-[0.2em] hover:brightness-75 transition-all border-b border-[#A85517]">Edit</button>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Shipment Contents</p>
                                        <div className="space-y-4">
                                            {cartItems.map((item) => (
                                                <div key={`${item._id}-${item.selectedColor}`} className="flex gap-5 p-5 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                                                        <img 
                                                            src={item.imageUrl?.startsWith('/') ? `${import.meta.env.VITE_API_URL}${item.imageUrl}` : item.imageUrl} 
                                                            className="w-full h-full object-cover" 
                                                            alt={item.name} 
                                                        />
                                                    </div>
                                                    <div className="flex-grow flex flex-col justify-center">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="text-sm font-black text-gray-900 line-clamp-1">{item.name}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-tighter">Qty: {item.quantity}</span>
                                                                    {item.selectedColor && (
                                                                        <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.selectedColor }}></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-black text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex gap-4">
                                    <button 
                                        onClick={prevStep}
                                        disabled={isSubmitting}
                                        className="w-1/3 py-5 rounded-[22px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all disabled:opacity-50"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={handlePlaceOrder}
                                        disabled={isSubmitting}
                                        className="flex-grow bg-[#A85517] text-white py-5 rounded-[22px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-900/20 hover:bg-[#8B4413] transition-all flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-6 h-6" />
                                                Complete Purchase
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <aside className="lg:w-96 shrink-0 w-full animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-2xl shadow-gray-200/40 sticky top-28">
                            <h2 className="text-xl font-black text-gray-900 mb-8 font-serif">Order Details</h2>
                            
                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900">${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500 font-bold">Complimentary</span>
                                </div>
                                <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <span>Est. Sales Tax</span>
                                    <span className="text-gray-900">${tax.toLocaleString()}</span>
                                </div>
                                <div className="pt-8 border-t border-gray-50 flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Grand Total</span>
                                        <span className="text-3xl font-black text-[#111827] leading-none">${total.toLocaleString()}</span>
                                    </div>
                                    <Lock className="w-5 h-5 text-gray-200 mb-1" />
                                </div>
                            </div>

                            <div className="bg-[#111827] p-6 rounded-[28px] shadow-xl shadow-gray-900/10 mb-8 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 -mr-10 -mt-10 rounded-full transition-transform group-hover:scale-150 duration-700" />
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
                                        <Truck className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-widest">Premium Delivery</p>
                                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-tight mt-1">Expected arrival in 5-7 days</p>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => navigate('/cart')} className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#A85517] transition-all uppercase tracking-[0.2em]">
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Return to Cart
                            </button>
                        </div>
                        
                        <div className="mt-8 flex items-center justify-center gap-6 px-4">
                            <ShieldCheck className="w-10 h-10 text-gray-200" />
                            <Lock className="w-8 h-8 text-gray-200" />
                            <CreditCard className="w-10 h-10 text-gray-200" />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
