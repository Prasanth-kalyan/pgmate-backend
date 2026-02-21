const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');

// @route   GET /api/owner/dashboard
// @desc    Get dashboard stats
// @access  Private (Owner)
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pgId = req.user.userId;

    // Get stats
    const totalTenants = await Tenant.countDocuments({ pgId, status: 'active' });
    const pendingPayments = await Payment.countDocuments({ pgId, status: 'pending' });
    const pendingComplaints = await Complaint.countDocuments({ pgId, status: { $ne: 'resolved' } });

    // Get recent payments
    const recentPayments = await Payment.find({ pgId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('tenantId', 'name room');

    // Get recent complaints
    const recentComplaints = await Complaint.find({ pgId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('tenantId', 'name room');

    res.json({
      success: true,
      stats: {
        totalTenants,
        pendingPayments,
        pendingComplaints,
      },
      recentPayments,
      recentComplaints,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/owner/tenants
// @desc    Get all tenants
// @access  Private (Owner)
router.get('/tenants', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tenants = await Tenant.find({ pgId: req.user.userId }).select('-password');
    res.json({ success: true, tenants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/owner/tenants
// @desc    Add new tenant
// @access  Private (Owner)
router.post('/tenants', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, phone, password, email, room, rent } = req.body;

    // Use the register tenant route instead
    // This is just a placeholder
    res.json({ success: true, message: 'Use /api/auth/register/tenant instead' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/owner/tenants/:id
// @desc    Update tenant
// @access  Private (Owner)
router.put('/tenants/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    res.json({ success: true, tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/owner/tenants/:id
// @desc    Delete tenant
// @access  Private (Owner)
router.delete('/tenants/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Tenant.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tenant removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;