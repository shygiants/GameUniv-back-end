var express = require('express');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var multer  = require('multer');

var config = require('../config');

var authenticator = require('../middlewares/authenticator');
var jwtAuthenticator = authenticator.jwtAuthenticator;
var accessAuthenticator = authenticator.accessAuthenticator;

var ErrorThrower = require('../utils/ErrorThrower');

var User = mongoose.model('User');
var router = express.Router();

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
      User.signup(req.body).then(function(user) {
        res.json({ token: Token.getAuthToken(user) });
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
  var projection = '-hashedPassword -profilePhoto -developed';
  var population = [{
    path: 'havePlayed',
    select: '-gameSecret -gameIcon -achievements'
  }];
  if (req.query.development) {
    projection = projection.replace(' -developed', '');
    population.push({
      path: 'developed',
      select: '-gameSecret -gameIcon -achievements'
    });
  }

  User.getByEmail(req.params.email, projection, population).then(function(user) {
    res.json(user);
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
});

router.put('/:email/profilePhotos', jwtAuthenticator,
  multer({ dest: 'profilePhotos/' }).single('profile_photo'), function(req, res, next) {
  var requester = req.requester;
  if (requester.email !== req.params.email) {
    next(new ErrorThrower('Wrong Token', 401));
    return;
  }

  requester.setProfilePhoto(req.file.path).then(function(user) {
    res.json(user.filename);
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
});

router.get('/:email/profilePhotos', function(req, res, next) {
  User.getProfilePhoto(req.params.email).then(function(user) {
    var profilePhoto = user.profilePhoto;
    var options = { root: __dirname + '/../' };

    res.sendFile(profilePhoto, options, function(err) {
      if (err) next(new ErrorThrower(err, 500));
    });
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
});

router.get('/', accessAuthenticator, function(req, res, next) {
  var accessInfo = req.accessInfo;
  User.getById(accessInfo.userId, 'userName email').then(function(user) {
    res.json(user);
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
});

module.exports = router;
