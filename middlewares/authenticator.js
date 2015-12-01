var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Game = mongoose.model('Game');
var ErrorThrower = require('../utils/ErrorThrower');
var config = require('../config');

module.exports = {
  jwtAuthenticator: function(req, res, next) {
    User.validateToken(req.headers.authorization).then(function(user) {
      req.user = user;
      next();
    }, function(err) {
      // there is something wrong
      if (err) next(new ErrorThrower(err, 500));
      else next(new ErrorThrower('Wrong Token', 401));
    });
  },
  localAuthenticator: function(req, res, next) {
    User.authenticate(req.params.email, req.body.passwd).then(function(user) {
      req.user = user;
      next();
    }, function(err) {
      if (err) next(new ErrorThrower(err, 500));
      else next(new ErrorThrower('Wrong Credential', 400));
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
            var userId = payload.sub;
            var gameId = req.body.client_id;
            User.login(userId, gameId).then(function() {
              var accessToken = jwt.sign({
                iss: gameId,
                sub: userId,
                aud: config.appName,
                exp: Math.floor(new Date() / 1000) + config.exp_access_token,
                typ: 'accessToken'
              }, config.secret);
              req.accessToken = accessToken;
              next();
            }, function(err) {
              next(new ErrorThrower(err, 500));
            });
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
  },
  accessAuthenticator: function(req, res, next) {
    jwt.verify(req.headers.authorization, config.secret, function(err, payload) {
      if (err) next(new ErrorThrower(err, 500));
      else if (payload.aud === config.appName &&
               payload.exp >= Math.floor(new Date() / 1000) &&
               payload.typ === 'accessToken') {
        req.userId = payload.sub;
        req.gameId = payload.iss;
        next();
      } else {
        // wrong token
        next(new ErrorThrower('Wrong token', 401))
      }
    });
  }
};
