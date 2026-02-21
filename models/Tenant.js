const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  pgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: String,
  room: {
    type: String,
    required: true,
  },
  rent: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: String,
    default: '5th of every month',
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  },
});

module.exports = mongoose.model('Tenant', tenantSchema);