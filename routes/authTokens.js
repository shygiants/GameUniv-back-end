var express = require('express');
var router = express.Router();
var passport = require('passport');

// router.get('/facebook', passport.authenticate('facebook', {
//   scope: ['email'],
//   failureRedirect: '/auth/failure'
// }));
//
// router.get('/facebook/callback', passport.authenticate('facebook', {
//   successRedirect: '/auth/success',
//   failureRedirect: '/auth/failure'
// }));

router.post('/:email', passport.authenticate('local', { session: false }),
  function(req, res) {
    if (req.params.email === req.user.email) {
      res.json({
        success: true,
        token: req.user.token
      });
    } else {
      res.json({
        success: false,
        message: 'Wrong Request'
      })
    }
});

module.exports = router;
