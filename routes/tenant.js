const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');

// @route   GET /api/tenant/dashboard
// @desc    Get tenant dashboard
// @access  Private (Tenant)
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tenantId = req.user.userId;

    // Get payments
    const payments = await Payment.find({ tenantId }).sort({ createdAt: -1 }).limit(5);

    // Get complaints
    const complaints = await Complaint.find({ tenantId }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      payments,
      complaints,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;