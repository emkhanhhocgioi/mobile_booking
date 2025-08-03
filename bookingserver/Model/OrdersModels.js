const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    UserID: { type: String, required: true },
    OwnerID: { type: String, required: true },
    HotelID: { type: String, required: true },
    Checkindate: { type: Date, required: true },
    Checkoutdate: { type: Date, required: true },
    Note: { type: String, required: true },
    orderDay: { type: Date, required: true },
    orderStatus:{type:String, required: true}
});

const Order = mongoose.model('Order', orderSchema); 

module.exports =  Order ;