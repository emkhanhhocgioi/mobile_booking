
  // models/account.js
  const mongoose = require('mongoose');

  const paymentorders = new mongoose.Schema({
    Orderid: { type: String, required: true },
    amount:{type: Number,required:true},
    currency: { type: String, required: true },
    userPaymentID: { type: String, required: true },
    
  });
  
  const Payment = mongoose.model('PaymentOrders', paymentorders);
  
  
  module.exports = Payment;
  