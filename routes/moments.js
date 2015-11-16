var express = require('express');
var mongoose = require('mongoose');
var Moment = mongoose.model('Moment');
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
  
})

module.exports = router;
