const mongoose = require('mongoose');

const post = new mongoose.Schema({
    PostID:{type:String,required:true},
    PosterID:{type:String,required:true},
    HotelName: {type:String,required:true},
    Address: {type:String,required:true},
    price:{type: Number,required:true},
    city:{type:String,required:true},
    country:{type:String,required:true},
    describe: {type:String,required:true},
    addon:{type:String,required:false}, // Make addon optional
    Posterimage:{type:[String],required:false,default:[]}, // Make images optional with default empty array
    rating:{type:Number,required:false,default:0}, // Make rating optional with default 0
    
}
)

// Prevent OverwriteModelError by checking if model already exists
module.exports = mongoose.models.Post || mongoose.model('Post', post);