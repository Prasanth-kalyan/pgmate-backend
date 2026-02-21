const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');

// @route   GET /api/payments
// @desc    Get all payments (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let payments;

    if (req.user.role === 'owner') {
      // Owner sees all payments for their PG
      payments = await Payment.find({ pgId: req.user.userId })
        .populate('tenantId', 'name room')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'tenant') {
      // Tenant sees only their payments
      payments = await Payment.find({ tenantId: req.user.userId })
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments
// @desc    Add payment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { tenantId, amount, month, dueDate, paidDate, status, method, transactionId } = req.body;
    const payment = new Payment({
      pgId: req.user.role === 'owner' ? req.user.userId : req.user.pgId,
      tenantId,
      amount,
      month,
      dueDate,
      paidDate,
      status,
      method,
      transactionId,
    });
    await payment.save();
    res.json({ success: true, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;