var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;

var config = require('../config');
var opts = {
  secretOrKey: config.secret
};

module.exports = function(passport) {
  passport.use(new JwtStrategy(opts, function(payload, done) {
    User.findOne({ email: payload.email }, { hashedPassword: false }, function(err, user) {
      if (err)
          return done(err, false);
      if (user)
          done(null, user);
      else {
          done(null, false);
          // or you could create a new account
      }
    });
  }));

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd'
  }, function(email, passwd, done) {
    User.findOne({ email: email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        done(null, false, { message: 'Unknown user' });
        return;
      }
      if (!user.authenticate(passwd)) {
        done(null, false, { message: 'Invalid password' });
        return;
      }

      var token = jwt.sign(user, config.secret);
      user.token = token;
      return done(null, user);
    })
  }));

  // passport.use(new FacebookStrategy({
  //   clientID: config.facebookClientId,
  //   clientSecret: config.facebookClientSecret,
  //   callbackURL: config.facebookCallbackURL,
  //   profileFields: ['emails']
  // }, function(accessToken, refreshToken, profile, done) {
  //   console.log(profile);
  //   console.log('accessToken: ' + accessToken);
  //
  //   User.findOne({ 'facebook.id': profile.id }, function(err, user) {
  //     if (err) { return done(err); }
  //     if (!user) {
  //       User.create({
  //         userName: profile.displayName,
  //         email: profile.emails[0].value,
  //         authToken: accessToken,
  //         facebook: profile._json
  //       }, function(err, user) {
  //         return done(err, user);
  //       });
  //     }
  //     return done(null, user);
  //   });
  // }));
};
