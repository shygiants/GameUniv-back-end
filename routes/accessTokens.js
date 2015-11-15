var express = require('express');
var router = express.Router();
var ErrorThrower = require('../utils/ErrorThrower');
var authorizationAuthenticator = require('../middlewares/authenticator').authorizationAuthenticator;
var config = require('../config');

router.post('/', function(req, res, next) {
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

router.use('/', function(err, req, res, next) {
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
