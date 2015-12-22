var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var config = require('../config');

var User = mongoose.model('User');

function Token(subject, issuer) {
  this.audience = config.appName;
  this.subject = subject;
  this.issuer = issuer;
}

Token.prototype.toAccessToken = function() {
  this.expiresIn = config.exp_access_token;

  return jwt.sign({ typ: 'accessToken' }, config.secret, this);
};

Token.prototype.toAuthCode = function() {
  this.expiresIn = config.exp_auth_code;

  return jwt.sign({ typ: 'authCode' }, config.secret, this);
};

Token.prototype.toAuthToken = function() {
  this.expiresIn = config.exp_auth_token;

  return jwt.sign({ typ: 'authToken' }, config.secret, this);
};

Token.getAccessToken = function(authCode, gameId) {
  var option = new Token();

  return new Promise(function(resolve, reject) {
    jwt.verify(authCode, config.secret, option, function(err, decoded) {
      if (err) reject(err);
      else if (decoded.typ === 'authCode')
        User.login(decoded.sub, gameId).then(function() {
          var token = new Token(decoded.sub, gameId);
          resolve(token.toAccessToken());
        }, reject);
      else reject();
    });
  });
};

Token.getAuthCode = function(userId, gameId) {
  var token = new Token(userId, gameId);

  return token.toAuthCode();
};

Token.getAuthToken = function(user) {
  var token = new Token(user._id);

  return token.toAuthToken();
};

Token.getUser = function(authToken) {
  var option = new Token();

  return new Promise(function(resolve, reject) {
    jwt.verify(authToken, config.secret, option, function(err, decoded) {
      if (err) reject(err);
      else if (decoded.typ === 'authToken')
        User.getById(decoded.sub).then(resolve, reject);
      else reject();
    });
  });
};

Token.getAccessInfo = function(accessToken) {
  var option = new Token();

  return new Promise(function(resolve, reject) {
    jwt.verify(accessToken, config.secret, option, function(err, decoded) {
      if (err) reject(err);
      else if (decoded.typ === 'accessToken')
        resolve({ userId: decoded.sub, gameId: decoded.iss });
      else reject();
    });
  });
}

module.exports = Token;
