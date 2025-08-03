
  // models/account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  Email: { type: String, required: true },
  Password: { type: String, required: true },
  urole: { type: Number, required: true },
  Desc:{type: String, required:true},
  PhoneNumber:{type:Number, required:true},
  followercount:{type:Number,requrie:true},
  followingcount:{type:Number,requrie:true},
  imgProfile:{type: String,requrie:true}
});

// Prevent OverwriteModelError by checking if model already exists
module.exports = mongoose.models.accounts || mongoose.model('accounts', accountSchema);
