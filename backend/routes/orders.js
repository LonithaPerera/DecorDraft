const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, subtotal, tax, total } = req.body;

        const newOrder = new Order({
            user: req.user.id,
            items,
            shippingAddress,
            paymentMethod,
            subtotal,
            tax,
            total
        });

        const order = await newOrder.save();
        res.status(201).json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
