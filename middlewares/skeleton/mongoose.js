
module.exports = function(mongoose) {
  mongoose.connect('mongodb://MONGO_DB_HOST/APP_COLLECTION');

  mongoose.connection.on('error', console.log);
  mongoose.connection.on('open', function() {
    console.log('MongoDB Open!');
  });
};
