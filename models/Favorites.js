const mongoose = require('mongoose');

const favoritesSchema = new mongoose.Schema({
  rentPlace: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'RentPlace'},
  user: {type:mongoose.Schema.Types.ObjectId, required:true},
  name: {type:String, required:true},
  monthlyPrice: Number,
});

const FavoritesModel = mongoose.model('Favorites', favoritesSchema);

module.exports = FavoritesModel;