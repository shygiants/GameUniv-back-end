var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var ErrorThrower = require('../utils/ErrorThrower');

router.post('/', function(req, res, next) {
  // validation
  req.checkBody('gameName', 'Game Name Required').notEmpty();
  req.checkBody('gameName', 'Invalid Game Name').isLength(3, 20);
  req.checkBody('contactEmail', 'Contact Email Required').notEmpty();
  req.checkBody('contactEmail', 'Invalid Contact Email').isEmail();

  req.asyncValidationErrors().then(function() {
    Game.register(req.body).then(function(game) {
      res.json({
        success: true,
        game: game
      });
    }, function(err) {
      next(new ErrorThrower(err, 500));
    });
  }, function(err) {
    // validation error
    next(new ErrorThrower(err, 400));
  });
});
module.exports = router;
