var express = require('express');
var mongoose = require('mongoose');
var Moment = mongoose.model('Moment');
var User = mongoose.model('User');
var ObjectId = mongoose.Types.ObjectId;
var router = express.Router();
var ErrorThrower = require('../utils/ErrorThrower');
var accessAuthenticator = require('../middlewares/authenticator').accessAuthenticator;

router.post('/', function(req, res, next) {
  req.checkBody('content', 'Content Required').notEmpty();

  req.asyncValidationErrors().then(next, function(err) {
    next(new ErrorThrower(err, 400));
  });
}, accessAuthenticator, function(req, res, next) {
  Moment.post(req.body.content, req.userId, req.gameId).then(function(moment) {
    console.log(moment);
    res.json({
      success: true,
      moment: moment._id
    });
  }, function(err) {
    // database error
    next(new ErrorThrower(err, 500));
  });
});

router.get('/:momentId', function(req, res, next) {
  // TODO: Authentication
  Moment.getById(req.params.momentId).then(function(moment) {
    res.json({
      success: true,
      moment: moment
    });
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower("There is no corresponding moment", 404));
  });
});

router.get('/forUser/:userEmail', accessAuthenticator, function(req, res, next) {
  User.getByEmail(req.params.userEmail).then(function(user) {
    Moment.getFeed(user).then(function(moments) {
      res.json({
        success: true,
        moments: moments
      });
    }, function(err) {
      if (err) next(new ErrorThrower(err, 500));
      else next(new ErrorThrower('Not Found', 404));
    })
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Wrong Token', 401));
  })
  req.userId
});

module.exports = router;
