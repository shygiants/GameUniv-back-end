var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  facebook: {}
});

UserSchema.methods = {
  authenticate: function(plainPasswd) {
    // TODO: compare plain password with hashed password
    return plainPasswd === this.hashedPassword;
  }
};

UserSchema.statics = {
  signup: function(body, callback) {
    // TODO: validation
    var created = new this({
      userName: body.userName,
      email: body.email,
      hashedPassword: body.passwd
    });
    created.save(function(err) {
      callback(err, created);
    });
  }
};

mongoose.model('User', UserSchema);
