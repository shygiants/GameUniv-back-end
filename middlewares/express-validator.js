var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = {
  options: {
    customValidators: {
      isEmailAvailable: function(email) {
        return new Promise(function(resolve, reject) {
          User.find({ email: email }, function(err, user) {
            if (err) reject(err);
            if (user) reject(err);
            else resolve(user);
          });
        });
      }
    }
  }
};
