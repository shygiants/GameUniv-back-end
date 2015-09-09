var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  userName: String,
  email: String,
  hashedPassword: { type: String, default: '' },
  authToken: String,
  facebook: {}
});

UserSchema.methods = {
  authenticate: function(plainPasswd) {
    // TODO: compare plain password with hashed password
    return plainPasswd === this.hashedPassword;
  }
};

UserSchema.statics = {

};

mongoose.model('User', UserSchema);
