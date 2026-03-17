const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Furniture'
            },
            name: String,
            price: Number,
            quantity: Number,
            selectedColor: String,
            imageUrl: String
        }
    ],
    shippingAddress: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        zipCode: String,
        country: String
    },
    paymentMethod: {
        type: String,
        default: 'card'
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
