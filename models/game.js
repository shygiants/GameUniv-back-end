var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
  gameName: { type: String, required: true },
  gameSecret: { type: String, required: true },
  contactEmail: { type: String, required: true }
});

mongoose.model('Game', GameSchema);
