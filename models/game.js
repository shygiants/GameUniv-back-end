var randomstring = require('randomstring');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var GameSchema = new Schema({
  gameName: { type: String, required: true },
  gameSecret: { type: String, required: true },
  contactEmail: { type: String, required: true }
});

GameSchema.methods = {

};

GameSchema.statics = {
  register: function(body) {
    var created = new this({
      gameName: body.gameName,
      gameSecret: randomstring.generate(20),
      contactEmail: body.contactEmail
    });

    return new Promise(function(resolve, reject) {
      created.save(function(err, game) {
        if (err) reject(err);
        else if (game) resolve(game);
      });
    });
  },
  authenticate: function(gameId, gameSecret) {
    var Game = this;
    return new Promise(function(resolve, reject) {
      Game.findOne({ _id: new ObjectId(gameId), gameSecret: gameSecret }
    , function(err, game) {
        if (err) reject(err);
        else if (game) resolve(game);
        else reject();
      });
    });
  },
  getById: function(gameId) {
    var Game = this;
    return new Promise(function(resolve, reject) {
      Game.findById(gameId, '-gameSecret', function(err, game) {
        if (err) reject(err);
        else if (game) resolve(game);
        else reject();
      })
    })
  }
};

mongoose.model('Game', GameSchema);
