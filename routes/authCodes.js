var express = require('express');
var router = express.Router();
var jwtAuthenticator = require('../middlewares/authenticator').jwtAuthenticator;
var jwt = require('jsonwebtoken');
var ErrorThrower = require('../utils/ErrorThrower');
var config = require('../config');

router.get('/:email', function(req, res, next) {
  req.checkParams('email', 'Invalid Email').isEmail();
  req.checkQuery('response_type', 'Response Type Required').notEmpty();
  req.checkQuery('response_type', 'Invalid Response Type').equals('code');
  req.checkQuery('client_id', 'Client ID Required').notEmpty();
  req.checkQuery('client_id', 'Invalid Client ID').isClientIdValid();

  req.asyncValidationErrors().then(next, function(err) {
    next(new ErrorThrower(err, 400));
  });
}, jwtAuthenticator, function(req, res, next) {
  var authCode = jwt.sign({
    iss: req.query.client_id,
    sub: req.user._id,
    aud: config.appName,
    exp: Math.floor(new Date() / 1000) + 30,
    typ: 'authCode'
  }, config.secret);

  console.log("AuthCode: %s", authCode);
  res.redirect(302, 'https://localhost?code=' + authCode);
});

// OAuth 2.0 Error Handler
router.use('/:email', function(err, req, res, next) {
  var errorCode = err.getStatusCode();
  var error = (errorCode == 500)? 'server_error' : 'invalid_request';
  console.log('ERROR: %s', error);
  res.redirect(302, 'https://localhost?error=' + error);
});

module.exports = router;
