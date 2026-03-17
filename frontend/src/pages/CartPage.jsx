import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Trash2, 
    Plus, 
    Minus, 
    ChevronRight, 
    ArrowLeft, 
    ShieldCheck, 
    Truck, 
    RotateCcw, 
    HelpCircle, 
    Star,
    Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/furniture`);
                // Get 4 random items for suggestions
                const shuffled = [...res.data].sort(() => 0.5 - Math.random());
                setSuggestedProducts(shuffled.slice(0, 4));
                setLoadingSuggestions(false);
            } catch (err) {
                console.error('Error fetching suggestions:', err);
                setLoadingSuggestions(false);
            }
        };
        fetchSuggestions();
    }, []);

    const shipping = 0;
    const total = cartTotal + shipping;

    return (
        <div className="pt-24 pb-20 bg-[#F9FAFB] min-h-screen">
            <div className="container mx-auto px-6 max-w-7xl">
                
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                    <Link to="/" className="hover:text-gray-600 font-bold uppercase tracking-tighter">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/store" className="hover:text-gray-900 font-bold uppercase tracking-tighter">Store</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-900 font-bold uppercase tracking-tighter">Cart</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-grow">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 mb-1">Your Cart</h1>
                                <p className="text-gray-500 font-medium">{cartItems.length} items in your cart</p>
                            </div>
                            {cartItems.length > 0 && (
                                <button onClick={clearCart} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                                    <Trash2 className="w-4 h-4" /> Clear Cart
                                </button>
                            )}
                        </div>

                        {cartItems.length > 0 ? (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={`${item._id}-${item.selectedColor}`} className="bg-white rounded-[32px] p-6 border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:shadow-gray-200/30 transition-all duration-300 group">
                                        <div className="w-full sm:w-48 h-48 bg-gray-50 rounded-[24px] overflow-hidden shrink-0 border border-gray-100">
                                            <img 
                                                src={item.imageUrl?.startsWith('/') ? `${import.meta.env.VITE_API_URL}${item.imageUrl}` : item.imageUrl} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        </div>
                                        <div className="flex-grow flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-[10px] font-black text-[#A85517] tracking-widest uppercase">{item.category}</span>
                                                    <h3 className="text-2xl font-black text-gray-900 mt-1">{item.name}</h3>
                                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-tighter mt-1">{item.material || 'Premium Quality'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-gray-900">${item.price}</p>
                                                    {item.quantity > 1 && <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1">${item.price} each</p>}
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {item.selectedColor && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                                                        <div className="w-3 h-3 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: item.selectedColor }}></div>
                                                        <span className="text-gray-600">Selected Finish</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                                                    <span className="text-gray-600">{item.dimensions?.width}W × {item.dimensions?.height}H × {item.dimensions?.depth}D cm</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-8 flex flex-wrap items-center justify-between gap-6">
                                                <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                                                    <button onClick={() => updateQuantity(item._id, -1, item.selectedColor)} className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-[#A85517] transition-all"><Minus className="w-4 h-4" /></button>
                                                    <span className="w-6 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item._id, 1, item.selectedColor)} className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-[#A85517] transition-all"><Plus className="w-4 h-4" /></button>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <Link to={`/store/${item._id}`} className="flex items-center gap-2 text-[10px] font-black text-[#A85517] hover:brightness-75 transition-all uppercase tracking-widest">
                                                        <Sparkles className="w-3.5 h-3.5" /> View Details
                                                    </Link>
                                                    <button onClick={() => removeFromCart(item._id, item.selectedColor)} className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-red-500 transition-all uppercase tracking-widest">
                                                        <Trash2 className="w-3.5 h-3.5" /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-12">
                                    <Link to="/store" className="inline-flex items-center gap-3 text-xs font-black text-gray-400 hover:text-[#A85517] transition-all group uppercase tracking-widest">
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[40px] p-24 text-center border border-gray-100 shadow-sm">
                                <div className="bg-orange-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-12 group hover:rotate-0 transition-transform duration-500">
                                    <Truck className="w-10 h-10 text-[#A85517]" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-4 font-serif">Your cart is empty</h3>
                                <p className="text-gray-500 font-medium mb-12 max-w-sm mx-auto leading-relaxed text-lg">Your sanctuary awaits. Start adding pieces that speak to your style.</p>
                                <Link to="/store" className="bg-[#111827] text-white px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-gray-900/20 hover:bg-[#A85517] transition-all hover:-translate-y-1">Start Shopping</Link>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                            {[
                                { icon: Truck, title: 'White Glove Delivery', desc: 'In-room placement included' },
                                { icon: ChevronRight, title: 'Scheduled Delivery', desc: 'Choose your preferred date' },
                                { icon: RotateCcw, title: '30-Day Returns', desc: 'Hassle-free return policy' }
                            ].map((service, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 flex items-start gap-5 hover:border-[#A85517]/20 transition-colors">
                                    <div className="bg-orange-50 p-4 rounded-2xl"><service.icon className="w-6 h-6 text-[#A85517]" /></div>
                                    <div><h4 className="font-black text-gray-900 text-sm uppercase tracking-tighter">{service.title}</h4><p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">{service.desc}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className="lg:w-[420px] shrink-0">
                        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-2xl shadow-gray-200/50 sticky top-28">
                            <h2 className="text-2xl font-black text-gray-900 mb-10 font-serif">Order Summary</h2>
                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between text-sm font-black text-gray-400 uppercase tracking-widest">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span className="text-gray-900">${cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-black text-gray-400 uppercase tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500">Complimentary</span>
                                </div>
                                <div className="pt-8 border-t border-gray-50 flex justify-between items-end">
                                    <span className="text-lg font-black text-gray-900 uppercase tracking-widest">Total</span>
                                    <div className="text-right">
                                        <span className="text-4xl font-black text-[#111827] block">${total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-10">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Promo Code</label>
                                <div className="relative">
                                    <input type="text" placeholder="Enter code" className="w-full bg-gray-50 border border-gray-100 rounded-[20px] py-4 pl-5 pr-28 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#A85517]/10 transition-all uppercase placeholder:normal-case"/>
                                    <button className="absolute right-2 top-2 bottom-2 bg-[#111827] text-white px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#A85517] transition-all">Apply</button>
                                </div>
                            </div>
                            <Link 
                                to="/checkout"
                                className="w-full bg-[#A85517] hover:bg-[#8B4413] text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl shadow-orange-900/20 mb-8 hover:-translate-y-1 active:translate-y-0"
                            >
                                <ShieldCheck className="w-5 h-5" /> Proceed to Checkout
                            </Link>
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10 bg-emerald-50/30 py-2 rounded-xl">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                Secure checkout • SSL encrypted
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-10">
                                {[
                                    { icon: Truck, text: 'Free\nReturns' },
                                    { icon: ShieldCheck, text: '2-Year\nWarranty' },
                                    { icon: HelpCircle, text: '24/7\nSupport' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center text-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-400"><item.icon className="w-5 h-5" /></div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase leading-tight tracking-tighter whitespace-pre-line">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>

                <div className="mt-40">
                    <div className="flex items-end justify-between mb-16 px-4">
                        <div><h2 className="text-4xl font-black text-gray-900 mb-3 font-serif">You Might Also Like</h2><p className="text-gray-500 font-medium text-lg">Curated pieces to complement your collection</p></div>
                        <Link to="/store" className="text-xs font-black text-[#A85517] hover:brightness-75 transition-all flex items-center gap-2 uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-[#A85517] pb-1">
                            View All Catalog <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {loadingSuggestions ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-[40px] aspect-[4/5] animate-pulse border border-gray-100"></div>
                            ))
                        ) : (
                            suggestedProducts.map((product) => (
                                <Link to={`/store/${product._id}`} key={product._id} className="group">
                                    <div className="relative aspect-[4/5] bg-white rounded-[40px] overflow-hidden border border-gray-100 mb-6 transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-gray-200/50 group-hover:-translate-y-3">
                                        <img 
                                            src={product.imageUrl?.startsWith('/') ? `${import.meta.env.VITE_API_URL}${product.imageUrl}` : product.imageUrl} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-gray-50">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            <span className="text-xs font-black text-gray-900">{product.rating || '4.5'}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span className="text-[10px] font-black text-[#A85517] tracking-[0.2em] uppercase">{product.category}</span>
                                        <h3 className="text-xl font-black text-gray-900 mt-2 line-clamp-1 group-hover:text-[#A85517] transition-colors">{product.name}</h3>
                                        <p className="text-2xl font-black text-gray-900 mt-2">${product.price}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
