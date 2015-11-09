var mongoose = require('mongoose');
var User = mongoose.model('User');
var ErrorThrower = require('../utils/ErrorThrower');

module.exports = {
  jwtAuthenticator: function(req, res, next) {
    User.validateToken(req.headers.authorization).then(function(user) {
      if (user.email === req.params.email) {
        // valid token
        req.user = user;
        next();
      } else
        next(new ErrorThrower('Wrong Token', 401));
    }, function(err) {
      // there is something wrong
      if (err) next(new ErrorThrower(err, 500));
      else next(new ErrorThrower('Wrong Token', 401));
    });
  },
  localAuthenticator: function(req, res, next) {
    User.getByEmail(req.params.email).then(function(user) {
      if (!user) {
        next(new ErrorThrower('Invalid Email', 400));
      } else if (user.authenticate(req.body.passwd)) {
        // authentication success
        req.user = user;
        next();
      } else {
        // wrong password
        next(new ErrorThrower('Wrong password', 400));
      }
    }, function(err) {
      // there is something wrong
      next(new ErrorThrower(err, 500));
    });
  }
};
