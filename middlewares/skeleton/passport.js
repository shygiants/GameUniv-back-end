var mongoose = require('mongoose');
var User = mongoose.model('User');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function(err, user) {
      done(err, user);
    })
  });

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd'
  }, function(email, passwd, done) {
    User.findOne({ email: email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        done(null, false, { message: 'Unknown user' });
      }
      if (!user.authenticate) {
        done(null, false, { message: 'Invalid password' });
      }
      return done(null, user);
    })
  }));

  passport.use(new FacebookStrategy({
    clientID: 'FACEBOOK_CLIENT_ID',
    clientSecret: 'FACEBOOK_CLIENT_SECRET',
    callbackURL: 'http://HOST/auth/facebook/callback',
    profileFields: ['emails']
  }, function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    console.log('accessToken: ' + accessToken);

    User.findOne({ 'facebook.id': profile.id }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        User.create({
          userName: profile.displayName,
          email: profile.emails[0].value,
          authToken: accessToken,
          facebook: profile._json
        }, function(err, user) {
          return done(err, user);
        });
      }
      return done(null, user);
    });
  }));
};
