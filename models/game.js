var randomstring = require('randomstring');
var mongoose = require('mongoose');
var fs = require('fs');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var GameSchema = new Schema({
  gameName: { type: String, required: true },
  gameSecret: { type: String, required: true },
  contactEmail: { type: String, required: true },
  gameIcon: String,
  achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }]
});

GameSchema.methods = {
  setGameIcon: function(filename) {
    var game = this;
    return new Promise(function(resolve, reject) {
      var original = game.gameIcon;
      game.gameIcon = filename;
      game.save(function(err, game, numAffected) {
        if (err) reject(err);
        else if (game) {
          if (original) fs.unlink(original, function(err) {
            if (err) reject(err);
            else resolve(game);
          });
          else resolve(game);
        }
        else reject();
      });
    });
  }
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
  getAllGames: function() {
    var Game = this;
    return new Promise(function(resolve, reject) {
      Game.find({}, '-gameSecret -gameIcon -achievements')
      .exec(function(err, games) {
        if (err) reject(err);
        else if (games) resolve(games);
        else reject();
      });

    });
  },
  getById: function(gameId, projection, population) {
    var Game = this;
    return new Promise(function(resolve, reject) {
      var query = Game.findById(gameId, projection);
      if (population)
        query.populate(population);
      query.exec(function(err, game) {
        if (err) reject(err);
        else if (game) resolve(game);
        else reject();
      });
    });
  },
  getGameIcon: function(gameId) {
    var Game = this;
    return new Promise(function(resolve, reject) {
      Game.findById(gameId, 'gameIcon', function(err, game) {
        if (err) reject(err);
        else if (game) resolve(game.gameIcon);
        else reject();
      });
    });
  },
  addAchievement: function(gameId, achievementId) {
    var Game = this;
    return new Promise(function(resolve, reject) {
      Game.findByIdAndUpdate(gameId, {
        $addToSet: { achievements: new ObjectId(achievementId) }
      }, function(err, numAffected) {
        if (err) reject(err);
        else if (numAffected == 0) reject();
        else resolve();
      });
    });
  }
};

mongoose.model('Game', GameSchema);
