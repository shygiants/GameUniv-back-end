var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multer  = require('multer');

var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var config = require('../config');
var ErrorThrower = require('../utils/ErrorThrower');
var jwtAuthenticator = require('../middlewares/authenticator').jwtAuthenticator;

// signup
router.post('/', function(req, res, next) {
  // validation
  req.checkBody('email', 'Email Required').notEmpty();
  req.checkBody('email', 'Invalid Email').isEmail();
  req.checkBody('email', 'Email already exists').isEmailAvailable();
  req.checkBody('passwd', 'Password Required').notEmpty()
  req.checkBody('passwd', 'Invalid Password').isLength(8, 20);
  req.checkBody('userName', 'User Name Required').notEmpty();
  req.checkBody('userName', 'Invalid User Name').isLength(3, 20);

  // executes validator
  req.asyncValidationErrors().then(function() {
      User.signup(req.body).then(function(token) {
        res.json({ token: token });
      }, function(err) {
        next(new ErrorThrower(err, 500));
      });
    }, function(err) {
      // validation error
      next(new ErrorThrower(err, 400));
    });
  });

router.get('/:email', function(req, res, next) {
    req.checkParams('email', 'Invalid Email').isEmail();

    // executes validator
    req.asyncValidationErrors().then(next, function(err) {
      // validation error
      next(new ErrorThrower(err, 400));
      });
    }, jwtAuthenticator, function(req, res, next) {
      User.getByEmail(req.params.email).then(function(user) {
        res.json(user);
      }, function(err) {
        if (err) next(new ErrorThrower(err, 500));
        else next(new ErrorThrower('Not Found', 404));
      });
    });

  router.put('/:email/profilePhotos', jwtAuthenticator,
    multer({ dest: 'profilePhotos/' }).single('profile_photo'), function(req, res, next) {
    if (req.user.email !== req.params.email) {
      next(new ErrorThrower('Wrong Token', 401));
      return;
    }

    req.user.setProfilePhoto(req.file.path).then(function(user) {
      res.json(user.filename);
    }, function(err) {
      if (err) next(new ErrorThrower(err, 500));
      else next(new ErrorThrower('Not Found', 404));
    });
  });

  router.get('/:email/profilePhotos', jwtAuthenticator,
  function(req, res, next) {
    User.getByEmail(req.params.email).then(function(user) {

      var options = { root: __dirname + '/../' };

      res.sendFile(user.profilePhoto, options, function(err) {
        if (err) next(new ErrorThrower(err, 500));
      });
    }, function(err) {
      if (err) next(new ErrorThrower(err, 500));
      else next(new ErrorThrower('Not Found', 404));
    });
  });

module.exports = router;
