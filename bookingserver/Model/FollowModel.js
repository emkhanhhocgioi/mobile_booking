const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    userid:{type:String,require:true},
    followid:{type:String,require:true},
}
)
const Follow = mongoose.model('follow', followSchema);

module.exports = Follow;