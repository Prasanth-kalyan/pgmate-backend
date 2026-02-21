const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  pgCode: {
    type: String,
    required: true,
    unique: true,
  },
  pgName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  ownerPhone: {
    type: String,
    required: true,
  },
  ownerEmail: String,
  address: String,
  totalRooms: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PG', pgSchema);