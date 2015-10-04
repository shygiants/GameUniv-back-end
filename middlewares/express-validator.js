var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = {
  options: {
    customValidators: {
      isEmailAvailable: function(email) {
        return new Promise(function(resolve, reject) {
          User.findOne({ email: email }, function(err, user) {
            if (err) reject(err);
            else if (user) reject(null);
            else resolve();
          });
        });
      }
    }
  }
};
