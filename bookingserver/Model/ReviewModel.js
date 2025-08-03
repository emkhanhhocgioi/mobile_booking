const mongoose = require('mongoose');

const review = new mongoose.Schema({
    ReviewID:{type:String,require:true},
    HotelID:{type:String,require:true},
    ReviewerID:{type:String,require:true},
    reviewcontent:{type:String,require:true},
    rating:{type:Number,require:true},
    images:[{type:String}] // Array of Cloudinary URLs
})

// Prevent OverwriteModelError by checking if model already exists
module.exports = mongoose.models.Review || mongoose.model('Review', review);