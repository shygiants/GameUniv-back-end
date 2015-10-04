var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var config = require('../config');
var passport = require('passport');

// signup
router.post('/', function(req, res) {
  req.checkBody('email', 'Email Required').notEmpty();
  req.checkBody('email', 'Invalid Email').isEmail();
  req.checkBody('email', 'Email already exists').isEmailAvailable();
  req.checkBody('passwd', 'Invalid Password').notEmpty().isLength(8, 20);
  req.checkBody('confirmPasswd', 'Invalid Password').equals(req.body.passwd);
  req.checkBody('userName', 'User Name Required').notEmpty();
  req.checkBody('userName', 'Invalid User Name').isLength(3, 20);

  req.asyncValidationErrors().then(function() {
    User.signup(req.body, function(err, user) {
      if (err) {
        res.json({
          success: false,
          message: 'Something wrong'
        })
      } else if (user) {
        var token = jwt.sign(user, config.secret);

        res.json({
          success: true,
          user: user,
          token: token
        });
      }
    });
  }, function(err) {
    res.json({
      success: false,
      message: err
    });
  });
});

router.get('/:email', passport.authenticate('jwt', { session: false }),
  function(req, res) {
    // TODO: validation
    if (req.user && req.params.email === req.user.email) {
      res.json({
        success: true,
        user: req.user
      })
    } else {
      res.json({
        success: false,
        message: 'Wrong token'
      })
    }
  })

module.exports = router;
