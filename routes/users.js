var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var config = require('../config');
var passport = require('passport');

// signup
router.post('/', function(req, res) {
  // req.checkBody({
  //   'email': {
  //     notEmpty: true,
  //     isEmail: true,
  //     errorMessage: 'Invalid Email'
  //   },
  //   'passwd': {
  //     notEmpty: true,
  //     isLength: {
  //       options: [8, 20]
  //     },
  //     errorMessage: 'Invalid Password'
  //   },
  //   'rePasswd': {
  //     notEmpty: true,
  //     matches: 'passwd',
  //     errorMessage: 'Invalid Password'
  //   },
  //   'userName': {
  //     notEmpty: true,
  //     errorMessage: 'Invalid User Name'
  //   }
  // });
  //
  // var errors = req.asyncValidationErrors().catch(function(err) {
  //   res.send(err);
  // });

  User.signup(req.body, function(err, user) {
    if (err) {
      // console.log(err);
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
