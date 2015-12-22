var mongoose = require('mongoose');

var User = mongoose.model('User');
var Game = mongoose.model('Game');
var ObjectId = mongoose.Types.ObjectId;

module.exports = {
  options: {
    errorFormatter: function(param, msg, value) {
      return msg;
    },
    customValidators: {
      isEmailAvailable: function(email) {
        // TODO: use getByEmail function
        return new Promise(function(resolve, reject) {
          User.findOne({ email: email }, function(err, user) {
            if (err) reject(err);
            else if (user) reject(null);
            else resolve();
          });
        });
      },
      isClientIdValid: function(clientId) {
        return new Promise(function(resolve, reject) {
          Game.findOne({ _id: new ObjectId(clientId) }, function(err, game) {
            if (err) reject(err);
            else if (game) resolve();
            else reject();
          });
        });
      }
    }
  }
};
