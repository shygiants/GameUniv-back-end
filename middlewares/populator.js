var mongoose = require('mongoose');

var ErrorThrower = require('../utils/ErrorThrower');

var User = mongoose.model('User');

module.exports = {
  userPopulator: function(req, res, next) {
    User.getByEmail(req.params.email).then(function(user) {
      req.user = user;
      next();
    }, function(err) {
      if (err) next(new ErrorThrower(err, 500));
      else next(new ErrorThrower('Not Found', 404));
    });
  }
};
