const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PG = require('../models/Pg');
const Tenant = require('../models/Tenant');
router.get('/test', (req, res) => {
  res.send('✅ AUTH ROUTER IS WORKING');
});

function generatePGCode(pgName) {
  const prefix = pgName.substring(0, 3).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-PG-${random}`;
}

// @route   POST /api/auth/register/owner
// @desc    Register PG Owner
// @access  Public


router.post('/register/owner', async (req, res) => {
  try {
   // console.log("____REGISTER ROUTE HIT______");
    const { pgName, username, password, ownerName, ownerPhone, ownerEmail, address, totalRooms } = req.body;
    let pg = await PG.findOne({ username });
    if (pg) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const pgCode = generatePGCode(pgName);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    pg = new PG({
      pgCode,
      pgName,
      username,
      password: hashedPassword,
      ownerName,
      ownerPhone,
      ownerEmail,
      address,
      totalRooms,
    });
    await pg.save();
    const payload = {
      userId: pg._id,
      role: 'owner',
      pgCode: pg.pgCode,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      user: {
        id: pg._id,
        username: pg.username,
        pgName: pg.pgName,
        pgCode: pg.pgCode,
        ownerName: pg.ownerName,
        role: 'owner',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/register/tenant
// @desc    Register Tenant (called by owner)
// @access  Private (Owner only)
router.post('/register/tenant', async (req, res) => {
  try {
    const { pgId, name, phone, password, email, room, rent } = req.body;

    // Check if tenant with same phone exists in this PG
    let tenant = await Tenant.findOne({ pgId, phone });
    if (tenant) {
      return res.status(400).json({ message: 'Tenant with this phone already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new tenant
    tenant = new Tenant({
      pgId,
      name,
      phone,
      password: hashedPassword,
      email,
      room,
      rent,
    });

    await tenant.save();

    res.json({
      success: true,
      message: 'Tenant registered successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        phone: tenant.phone,
        room: tenant.room,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login (Owner or Tenant)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    let user;
    let payload;

    if (role === 'owner') {
      // Owner login with username
      user = await PG.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      payload = {
        userId: user._id,
        role: 'owner',
        pgCode: user.pgCode,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          pgName: user.pgName,
          pgCode: user.pgCode,
          ownerName: user.ownerName,
          role: 'owner',
        },
      });
    } else if (role==='tenant') {
      // Tenant login with phone
      user = await Tenant.findOne({ phone: username }).populate('pgId');
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      payload = {
        userId: user._id,
        role: 'tenant',
        pgId: user.pgId._id,
        room: user.room,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          room: user.room,
          pgName: user.pgId.pgName,
          pgCode: user.pgId.pgCode,
          role: 'tenant',
        },
      });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    if (req.user.role === 'owner') {
      const pg = await PG.findById(req.user.userId).select('-password');
      res.json({ success: true, user: pg, role: 'owner' });
    } else if (req.user.role === 'tenant') {
      const tenant = await Tenant.findById(req.user.userId).select('-password').populate('pgId');
      res.json({ success: true, user: tenant, role: 'tenant' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;