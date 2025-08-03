const mongoose = require('mongoose');

const destination = new mongoose.Schema({
    DestinationName:{type:String,require:true},
    DestinationCountry:{type:String,require:true},
    DestinationDesc:{type:String,require:true},
    Destinationimg:{type:String,require:true},
})
    


const Destination = mongoose.model('Destination', destination);

module.exports = Destination;