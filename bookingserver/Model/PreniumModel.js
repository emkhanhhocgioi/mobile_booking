
  // models/account.js
  const mongoose = require('mongoose');

  const subscript = new mongoose.Schema({
    Userid: { type: String, required: true },
    status:{type: Number,required:true},
    signupdate: { type: Date, required: true },
    expiredate: { type: Date, required: true },
    
  });
  
  const Subscript = mongoose.model('subscription', subscript);
  
  
  module.exports = Subscript;
  