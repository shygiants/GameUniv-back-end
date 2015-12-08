var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var fs = require('fs');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
var config = require('../config');

var cipher;

var UserSchema = new Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, index: true },
  hashedPassword: { type: String, required: true },
  havePlayed: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
  profilePhoto: String,
  developed: [{ type: Schema.Types.ObjectId, ref: 'Game' }]
});

UserSchema.methods = {
  authenticate: function(plainPasswd) {
    cipher = crypto.createCipher('aes192', config.secret);
    cipher.update(plainPasswd, 'utf8', 'base64');
    return cipher.final('base64') === this.hashedPassword;
  },
  getAuthToken: function() {
    // TODO: Add iss, sub, exp...
    return jwt.sign(this, config.secret);
  },
  setProfilePhoto: function(filename) {
    var user = this;
    return new Promise(function(resolve, reject) {
      var original = user.profilePhoto;
      user.profilePhoto = filename;
      user.save(function(err, user, numAffected) {
        if (err) reject(err);
        else if (user) {
          if (original != null) fs.unlink(original, function(err) {
            if (err) reject(err);
            else resolve(user);
          });
          else resolve(user);
        }
        else reject();
      });
    });
  }
};

UserSchema.statics = {
  getByEmail: function(email, developed) {
    var User = this;
    return new Promise(function(resolve, reject) {
      var projection = '-hashedPassword -profilePhoto';
      projection += (developed)? '' : ' -developed';

      var query = User.findOne({ email: email }, projection)
      .populate('havePlayed', '-gameSecret');
      if (developed) query = query.populate('developed', '-gameSecret');
      query.exec(function(err, user) {
        if (err) reject(err);
        else if (user) resolve(user);
        else reject();
      });
    });
  },
  authenticate: function(email, plainPasswd) {
    var User = this;
    return new Promise(function(resolve, reject) {
      User.findOne({ email: email }, function(err, user) {
        if (err) reject(err);
        else if (user && user.authenticate(plainPasswd)) resolve(user);
        else reject();
      });
    });
  },
  validateToken: function(token) {
    var User = this;
    return new Promise(function(resolve, reject) {
      jwt.verify(token, config.secret, function(err, payload) {
        if (err) reject(err);
        else {
          // token is decoded
          User.findOne({
            email: payload.email,
            hashedPassword: payload.hashedPassword
          }, { hashedPassword: false, profilePhoto: false })
          .populate('havePlayed', '-gameSecret')
          .populate('developed')
          .exec(function(err, user) {
            if (err) reject(err);
            else if (user) resolve(user);
            else reject();
          });
        }
      });
    });
  },
  signup: function(body) {
    // TODO: validation
    cipher = crypto.createCipher('aes192', config.secret);
    cipher.update(body.passwd, 'utf8', 'base64');

    var created = new this({
      userName: body.userName,
      email: body.email,
      hashedPassword: cipher.final('base64')
    });

    return new Promise(function(resolve, reject) {
      created.save(function(err, user) {
        if (err) reject(err);
        else if (user) {
          var token = jwt.sign(user, config.secret);
          resolve(token);
        }
      });
    });
  },
  login: function(userId, gameId) {
    var User = this;
    return new Promise(function(resolve, reject) {
      User.findByIdAndUpdate(userId, { $addToSet: { havePlayed: new ObjectId(gameId) }}
      , function(err, numAffected) {
        if (err || numAffected == 0) reject(err);
        else resolve();
      });
    });
  },
  getProfilePhoto: function(email) {
    var User = this;
    return new Promise(function(resolve, reject) {
      User.findOne({ email: email }, 'profilePhoto')
      .exec(function(err, user) {
        if (err) reject(err);
        else if (user) resolve(user.profilePhoto);
        else reject();
      });
    })
  }
};

mongoose.model('User', UserSchema);
