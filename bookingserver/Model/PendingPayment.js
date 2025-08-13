const mongoose = require('mongoose');

const PendingPaymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Tự động xóa sau 1 giờ
  }
});

module.exports = mongoose.model('PendingPayment', PendingPaymentSchema);
