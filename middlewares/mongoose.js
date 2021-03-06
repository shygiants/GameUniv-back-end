var config = require('../config');

module.exports = function(mongoose) {
  mongoose.connect('mongodb://' + config.mongodbHost + '/' + config.database);

  mongoose.connection.on('error', console.log);
  mongoose.connection.on('open', function() {
    console.log('MongoDB Open!');
  });
};
