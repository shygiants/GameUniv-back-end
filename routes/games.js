var express = require('express');
var router = express.Router();
var multer  = require('multer');
var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var Achievement = mongoose.model('Achievement');
var Contents = mongoose.model('Contents');
var ErrorThrower = require('../utils/ErrorThrower');
var jwtAuthenticator = require('../middlewares/authenticator').jwtAuthenticator;

router.post('/', function(req, res, next) {
  // validation
  req.checkBody('gameName', 'Game Name Required').notEmpty();
  req.checkBody('gameName', 'Invalid Game Name').isLength(3, 20);
  req.checkBody('contactEmail', 'Contact Email Required').notEmpty();
  req.checkBody('contactEmail', 'Invalid Contact Email').isEmail();

  req.asyncValidationErrors().then(function() {
    // TODO: Check auth token and add game to user
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

router.get('/', function(req, res, next) {
  Game.getAllGames().then(function(games) {
    res.json(games);
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
});

router.get('/:gameId', jwtAuthenticator, function(req, res, next) {
  var gameId = req.params.gameId;
  var projection = '-gameIcon -gameSecret -achievements';
  var population;

  if (req.query.development) {
    var games = req.requester.developed;
    if (games.indexOf(gameId) == -1) {
      next(new ErrorThrower('Not Found', 404));
      return;
    }
    projection = projection.replace('-gameSecret -achievements', '');
    population = {
      path: 'achievements',
      select: '-icon'
    };
  }

  Game.getById(gameId, projection, population).then(function(game) {
    res.json(game);
  }, function(err) {
    if (err) next(new ErrorThrower(err, 500));
    else next(new ErrorThrower('Not Found', 404));
  });
});

router.put('/:gameId/gameIcons', multer({
  dest: 'gameIcons/',
  limits: { fieldNameSize: 10240000 }
}).single('game_icon'), jwtAuthenticator, function(req, res, next) {
  var gameId = req.params.gameId;
  var games = req.requester.developed;
  if (games.indexOf(gameId) != -1) {
    Game.getById(gameId).then(function(game) {
      game.setGameIcon(req.file.path).then(function(game) {
        res.json(game._id);
      }, function(err) {
        if (err) next(new ErrorThrower(err, 500));
        else next(new ErrorThrower('Not Found', 404));
      });
    });
  } else next(new ErrorThrower('Not Found', 404));
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

router.post('/:gameId/achievements', function(req, res, next) {
  // TODO: Validation
  req.checkBody('title', 'Title Required').notEmpty();
  req.checkBody('desc', 'Description Required').notEmpty();
  req.checkBody('point', 'Point Required').notEmpty();

  req.asyncValidationErrors().then(next, function(err) {
    next(new ErrorThrower(err, 400));
  });
}, jwtAuthenticator, function(req, res, next) {
  var gameId = req.params.gameId;
  var games = req.requester.developed;
  if (games.indexOf(gameId) == -1) {
    next(new ErrorThrower('Not Found', 404));
    return;
  }
  var body = req.body;
  Achievement.create(body.title, body.desc, body.point).then(
    function(achievementId) {
      Game.addAchievement(gameId, achievementId).then(
        function() {
          res.json({ achievementId: achievementId });
        }, function(err) {
          // TODO: Delete created achievement
          if (err) next(new ErrorThrower(err, 500));
          else next(new ErrorThrower('Not Found', 404));
        }
      );
    }, function (err) {
      if (err) next(new ErrorThrower(err, 500));
      else next(new ErrorThrower('Something Wrong', 500));
    });
});

router.put('/:gameId/contents', multer({
  dest: 'contentsPhotos/',
  limits: { fieldNameSize: 10240000 }
}).array('contents_photos'), function(req, res, next) {
  req.checkBody('contents', 'Contents required').notEmpty();

  req.asyncValidationErrors().then(next, function(err) {
    next(new ErrorThrower(err, 400));
  });
}, jwtAuthenticator, function(req, res, next) {
  var gameId = req.params.gameId;
  var userId = req.requester._id;
  
  // TODO: Validation JSON
  var contents = JSON.parse(req.body.contents);
  var files = req.files;
  
  var created = Contents.create(contents.title, contents.description, files[0], userId, gameId);
  created.addPages(contents.pages, req.files);
  created.save(function(err) {
    if (err) {
      next(new ErrorThrower(err, 500));
      return;
    }
  });
  
  res.json({
    contents_id: created._id
  });
});

module.exports = router;
