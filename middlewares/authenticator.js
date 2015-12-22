var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var config = require('../config');

var ErrorThrower = require('../utils/ErrorThrower');
var Token = require('../utils/Token');

var User = mongoose.model('User');
var Game = mongoose.model('Game');


module.exports = {
  jwtAuthenticator: function(req, res, next) {
    Token.getUser(req.headers.authorization).then(function(user) {
      req.requester = user;
      next();
    }, function(err) {
      // there is something wrong
      if (err) next(new ErrorThrower(err, 500));
      else next(new ErrorThrower('Wrong Token', 401));
    });
  },
  localAuthenticator: function(req, res, next) {
    User.authenticate(req.params.email, req.body.passwd).then(function(user) {
      req.requester = user;
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
        Token.getAccessToken(req.body.code, req.body.client_id).then(
          function(accessToken) {
            req.accessToken = accessToken;
            next();
          }, function(err) {
            if (err) next(new ErrorThrower(err, 500));
            else next(new ErrorThrower('Wrong request', 400))
          });
      }, function(err) {
        if (err) next(new ErrorThrower(err, 500));
        else next(new ErrorThrower('Wrong request', 400));
      });
  },
  accessAuthenticator: function(req, res, next) {
    Token.getAccessInfo(req.headers.authorization).then(
      function(accessInfo) {
        req.accessInfo = accessInfo;
        next();
      }, function(err) {
        next(new ErrorThrower('Wrong token', 401))
      });
  }
};
