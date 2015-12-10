var express = require('express');
var mongoose = require('mongoose');
var Moment = mongoose.model('Moment');
var User = mongoose.model('User');
var ObjectId = mongoose.Types.ObjectId;
var router = express.Router();
var ErrorThrower = require('../utils/ErrorThrower');
var accessAuthenticator = require('../middlewares/authenticator').accessAuthenticator;
var jwtAuthenticator = require('../middlewares/authenticator').jwtAuthenticator;

router.post('/', function(req, res, next) {
  req.checkBody('content', 'Content Required').notEmpty();

  req.asyncValidationErrors().then(next, function(err) {
    next(new ErrorThrower(err, 400));
  });
}, accessAuthenticator, function(req, res, next) {
  Moment.post(req.body.content, 'text', req.userId, req.gameId).then(function(moment) {
    console.log(moment);
    res.json({ moment_id: moment._id });
  }, function(err) {
    // database error
    next(new ErrorThrower(err, 500));
  });
});

router.post('/score', function(req, res, next) {
  req.checkBody('score', 'Score Required').notEmpty();

  req.asyncValidationErrors().then(next, function(err) {
    next(new ErrorThrower(err, 400));
  });
}, accessAuthenticator, function(req, res, next) {
  Moment.post(req.body.score, 'score', req.userId, req.gameId).then(function(moment) {
    console.log(moment);
    res.json({ moment_id: moment._id });
  }, function(err) {
    // database error
    next(new ErrorThrower(err, 500));
  });
});

router.post('/achievements', function(req, res, next) {
  // TODO: Check achievement id
  req.checkBody('achievement', 'Achievement Required').notEmpty();

  req.asyncValidationErrors().then(next, function(err) {
    next(new ErrorThrower(err, 400));
  });
}, accessAuthenticator, function(req, res, next) {
  Moment.postAchievement(req.body.achievement, 'achievement', req.userId, req.gameId)
  .then(function(moment) {
    console.log(moment);
    res.json({ moment_id: moment._id });
  }, function(err) {
    next(new ErrorThrower(err, 500));
  });
});

router.get('/:momentId', function(req, res, next) {
  // TODO: Authentication
  Moment.getById(req.params.momentId).then(function(moment) {
    res.json(moment);
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower("There is no corresponding moment", 404));
  });
});

router.get('/feed/users/:email', jwtAuthenticator, function(req, res, next) {
  if (req.user.email !== req.params.email) {
    next(new ErrorThrower('Wrong Token', 401));
    return;
  }

  Moment.getFeed(req.user).then(function(moments) {
    res.json(moments);
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
});

router.get('/timeline/users/:email', jwtAuthenticator, function(req, res, next) {
  Moment.getTimelineForUser(req.user).then(function(moments) {
    res.json(moments);
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
});

router.get('/timeline/games/:gameId', jwtAuthenticator, function(req, res, next) {
  Moment.getTimelineForGame(req.params.gameId).then(function(moments) {
    res.json(moments);
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
});

module.exports = router;
