const mongoose = require('mongoose');

const rentPlaceSchema = new mongoose.Schema({
  owner: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
  title: String,
  country:String,
  region:String,
  address: String,
  photos: [String],
  description: String,
  perks: [String],
  extraInfo: String,
  maxPeople: Number,
  monthlyPrice: Number,
  date: {
    type: Date,
    required: true,
  },
  likes:{type:Number,default:0},
  availability:{type:String, default: 'Available'}
});

const RentPlaceModel = mongoose.model('RentPlace', rentPlaceSchema);

module.exports = RentPlaceModel;