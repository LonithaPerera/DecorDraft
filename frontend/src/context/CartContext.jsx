import { createContext, useState, useEffect, useContext } from 'react';

export const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('decorDraftCart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('decorDraftCart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1, selectedColor = null) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item._id === product._id && item.selectedColor === selectedColor);
            if (existingItem) {
                return prev.map(item =>
                    item === existingItem
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity, selectedColor }];
        });
    };

    const removeFromCart = (productId, selectedColor = null) => {
        setCartItems(prev => prev.filter(item => !(item._id === productId && item.selectedColor === selectedColor)));
    };

    const updateQuantity = (productId, delta, selectedColor = null) => {
        setCartItems(prev => prev.map(item => {
            if (item._id === productId && item.selectedColor === selectedColor) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
