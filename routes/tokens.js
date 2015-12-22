// Packages
var express = require('express');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
// Configuration
var config = require('../config');
// Middlewares
var jwtAuthenticator = require('../middlewares/authenticator').jwtAuthenticator;
var localAuthenticator = require('../middlewares/authenticator').localAuthenticator;
var authorizationAuthenticator = require('../middlewares/authenticator').authorizationAuthenticator;
// Utils
var ErrorThrower = require('../utils/ErrorThrower');
var Token = require('../utils/Token');

var router = express.Router();

router.get('/authCodes/:email', function(req, res, next) {
  req.checkParams('email', 'Invalid Email').isEmail();
  req.checkQuery('response_type', 'Response Type Required').notEmpty();
  req.checkQuery('response_type', 'Invalid Response Type').equals('code');
  req.checkQuery('client_id', 'Client ID Required').notEmpty();
  req.checkQuery('client_id', 'Invalid Client ID').isClientIdValid();

  req.asyncValidationErrors().then(next, function(err) {
    next(new ErrorThrower(err, 400));
  });
}, jwtAuthenticator, function(req, res, next) {
  if (req.user.email !== req.params.email) {
    next(new ErrorThrower('Wrong Token', 401));
    return;
  }

  var authCode = Token.getAuthCode(req.query.client_id, req.user._id);

  res.redirect(302, 'https://localhost?code=' + authCode);
});

// OAuth 2.0 Error Handler
router.use('/authCodes/:email', function(err, req, res, next) {
  var errorCode = err.getStatusCode();
  var error = (errorCode == 500)? 'server_error' : 'invalid_request';
  console.log('ERROR: %s', error);
  res.redirect(302, 'https://localhost?error=' + error);
});

router.post('/authTokens/:email', function(req, res, next) {
  req.checkParams('email', 'Invalid Email').isEmail();
  req.checkBody('passwd', 'Password Required').notEmpty();

  req.asyncValidationErrors().then(next, function(err) {
    // validation error
    next(new ErrorThrower(err, 400));
  });
}, localAuthenticator, function(req, res, next) {
  res.json({
    token: Token.getAuthToken(req.requester)
  });
});

router.post('/accessTokens', function(req, res, next) {
  req.checkBody('grant_type','Grant Type Required').notEmpty();
  req.checkBody('grant_type','Invalid Grant Type').equals('authorization_code');
  req.checkBody('code', 'Code Required').notEmpty();
  req.checkBody('client_id', 'Client ID Required').notEmpty();

  req.asyncValidationErrors().then(next, function(err) {
    next(new ErrorThrower(err, 400));
  });
}, authorizationAuthenticator, function(req, res, next) {
  res.json({
    access_token: req.accessToken,
    token_type: 'JWT',
    expires_in: config.exp_access_token
  });
});

router.use('/accessTokens', function(err, req, res, next) {
  console.log(err);
  var errorCode = err.getStatusCode();
  var error = (errorCode == 500)? 'server_error' : 'invalid_request';
  console.log('ERROR: %s', error);
  res.status(errorCode);
  res.json({
    error: error
  });
});

module.exports = router;
