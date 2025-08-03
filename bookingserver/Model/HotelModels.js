const mongoose = require('mongoose');

const hotel = mongoose.Schema({
    HotelName: { type: String, required: true },  // corrected 'require' to 'required'
    Gmail: { type: String, required: true },
    Password: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    amenities: { type: String, required: true },
    price_per_night: { type: String, required: true },
    host: { type: String, required: true },
    phonenumber: { type: String, required: true },
    
});

const HotelModel = mongoose.model('Hotel', hotel);

module.exports = HotelModel;  // exporting the model
