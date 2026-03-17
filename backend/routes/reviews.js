const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Furniture = require('../models/Furniture');
const User = require('../models/User');

// @route   POST /api/reviews
// @desc    Post a product review
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { productId, orderId, rating, comment } = req.body;

        // 1. Verify order exists, belongs to user, and is 'Delivered'
        const order = await Order.findOne({ _id: orderId, user: req.user.id });
        if (!order) return res.status(404).json({ msg: 'Order not found' });
        if (order.status !== 'Delivered') return res.status(400).json({ msg: 'Only delivered items can be reviewed' });

        // 2. Verify product is in that order
        const hasItem = order.items.some(item => item.product.toString() === productId);
        if (!hasItem) return res.status(400).json({ msg: 'Product not found in this order' });

        // 3. Check if they already reviewed this item for this order (to prevent duplicates)
        const alreadyReviewed = await Review.findOne({ user: req.user.id, product: productId, order: orderId });
        if (alreadyReviewed) return res.status(400).json({ msg: 'Item already reviewed' });

        const user = await User.findById(req.user.id);

        // 4. Create review
        const review = new Review({
            user: req.user.id,
            product: productId,
            order: orderId,
            rating,
            comment,
            userName: user.name
        });

        await review.save();

        // 5. Update furniture rating stats
        const allReviews = await Review.find({ product: productId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await Furniture.findByIdAndUpdate(productId, {
            rating: avgRating.toFixed(1),
            reviews: allReviews.length
        });

        res.status(201).json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
