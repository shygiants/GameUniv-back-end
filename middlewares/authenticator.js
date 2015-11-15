var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Game = mongoose.model('Game');
var ErrorThrower = require('../utils/ErrorThrower');
var config = require('../config');


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
  },
  authorizationAuthenticator: function(req, res, next) {
    Game.authenticate(req.body.client_id, req.headers.authorization).then(
      function(game) {
        // game authenticated
        jwt.verify(req.body.code, config.secret, function(err, payload) {
          if (err) next(new ErrorThrower(err, 500));
          else if (game._id == payload.iss &&
              payload.aud === config.appName &&
              payload.exp >= Math.floor(new Date() / 1000) &&
              payload.typ === 'authCode') {
            // valid token
            var accessToken = jwt.sign({
              iss: req.query.client_id,
              sub: payload.sub,
              aud: config.appName,
              exp: Math.floor(new Date() / 1000) + config.exp_access_token,
              typ: 'accessToken'
            }, config.secret);
            req.accessToken = accessToken;
            next();
          } else {
            // wrong request
            next(new ErrorThrower('Wrong request', 400));
          }
        });
      }, function(err) {
        if (err) next(new ErrorThrower(err, 500));
        else next(new ErrorThrower('Wrong request', 400));
      }
    );
  }
};
