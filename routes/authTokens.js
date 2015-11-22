var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ErrorThrower = require('../utils/ErrorThrower');
var localAuthenticator = require('../middlewares/authenticator').localAuthenticator;

router.post('/:email', function(req, res, next) {
    req.checkParams('email', 'Invalid Email').isEmail();
    req.checkBody('passwd', 'Password Required').notEmpty();

    req.asyncValidationErrors().then(next, function(err) {
      // validation error
      next(new ErrorThrower(err, 400));
    });
  }, localAuthenticator, function(req, res, next) {
      res.json({
        token: req.user.getAuthToken()
      });
  });

module.exports = router;
