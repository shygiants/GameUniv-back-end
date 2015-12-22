var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var fs = require('fs');

var config = require('../config');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
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
  getById: function(userId, projection) {
    var User = this;
    return new Promise(function(resolve, reject) {
      User.findById(userId, projection, function(err, user) {
        if (err) reject(err);
        else if (user) resolve(user);
        else reject();
      });
    });
  },
  getByEmail: function(email, projection, population) {
    var User = this;
    return new Promise(function(resolve, reject) {
      var query = User.findOne({ email: email }, projection);
      if (population)
        query.populate(population);
      query.exec(function(err, user) {
        if (err) reject(err);
        else if (user) resolve(user);
        else reject();
      });
    });
  },
  authenticate: function(email, plainPasswd) {
    var User = this;
    cipher = crypto.createCipher('aes192', config.secret);
    cipher.update(plainPasswd, 'utf8', 'base64');
    var hashedPassword = cipher.final('base64');

    return new Promise(function(resolve, reject) {
      User.findOne({ email: email, hashedPassword: hashedPassword },
      function(err, user) {
        if (err) reject(err);
        else if (user) resolve(user);
        else reject();
      });
    });
  },
  signup: function(body) {
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
        else if (user) resolve(user);
      });
    });
  },
  login: function(userId, gameId) {
    var User = this;
    return new Promise(function(resolve, reject) {
      User.findByIdAndUpdate(userId, { $addToSet: { havePlayed: new ObjectId(gameId) }}
      , function(err, numAffected) {
        if (err) reject(err);
        else if (numAffected == 0) reject();
        else resolve();
      });
    });
  },
  getProfilePhoto: function(email) {
    return this.getByEmail(email, 'profilePhoto');
  }
};

mongoose.model('User', UserSchema);
