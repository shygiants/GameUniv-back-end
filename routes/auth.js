var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email'],
  failureRedirect: '/auth/failure'
}));

router.get('/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/auth/success',
  failureRedirect: '/auth/failure'
}));

router.get('/success', function(req, res) {
  res.send('success');
});

router.get('/failure', function(req, res) {
  res.send('failure');
});


module.exports = router;
