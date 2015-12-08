var express = require('express');
var router = express.Router();
var multer  = require('multer');
var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var ErrorThrower = require('../utils/ErrorThrower');
var jwtAuthenticator = require('../middlewares/authenticator').jwtAuthenticator;

router.post('/', function(req, res, next) {
  // validation
  req.checkBody('gameName', 'Game Name Required').notEmpty();
  req.checkBody('gameName', 'Invalid Game Name').isLength(3, 20);
  req.checkBody('contactEmail', 'Contact Email Required').notEmpty();
  req.checkBody('contactEmail', 'Invalid Contact Email').isEmail();

  req.asyncValidationErrors().then(function() {
    Game.register(req.body).then(function(game) {
      res.json(game);
    }, function(err) {
      next(new ErrorThrower(err, 500));
    });
  }, function(err) {
    // validation error
    next(new ErrorThrower(err, 400));
  });
});

router.get('/:gameId', function(req, res, next) {
  if (req.query.development) {
    next();
    return;
  }
  Game.getById(req.params.gameId).then(function(game) {
    res.json(game);
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
}, jwtAuthenticator, function(req, res, next) {
  var games = req.user.developed.filter(function(game) {
    return (game._id == req.params.gameId);
  });

  if (typeof games !== 'undefined' || games.length > 0)
    res.json(games[0]);
  else
    next(new ErrorThrower('Not Found', 404))
});

router.put('/:gameId/gameIcons', multer({
  dest: 'gameIcons/',
  limits: { fieldNameSize: 10240000 }
}).single('game_icon'), jwtAuthenticator,
  function(req, res, next) {
    var games = req.user.developed.filter(function(game) {
      return (game._id == req.params.gameId);
    });

    if (typeof games !== 'undefined' || games.length > 0) {
      var game = games[0];
      console.log(req.file.path);
      game.setGameIcon(req.file.path).then(function(game) {
        res.json(game._id);
      }, function(err) {
        if (err) next(new ErrorThrower(err, 500));
        else next(new ErrorThrower('Not Found', 404));
      });
    }
    else
      next(new ErrorThrower('Not Found', 404));
});

router.get('/:gameId/gameIcons', function(req, res, next) {
  Game.getGameIcon(req.params.gameId).then(function(gameIcon) {
    var options = { root: __dirname + '/../' };

    res.sendFile(gameIcon, options, function(err) {
      if (err) next(new ErrorThrower(err, 500));
    });
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
});


module.exports = router;
