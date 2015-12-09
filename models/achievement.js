var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var AchievementSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  point: { type: Number, required: true },
  game: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
  icon: String
});

AchievementSchema.methods = {

};

AchievementSchema.statics = {
  create: function(gameId, title, desc, point) {
    var Achievement = this;

    return new Promise(function(resolve, reject) {
      var created = new Achievement({
        title: title,
        description: desc,
        point: point,
        game: new ObjectId(gameId)
      });

      created.save(function(err, achievement) {
        if (err) reject(err);
        else if (achievement) resolve(achievement._id);
        else reject();
      });
    });
  }
};

mongoose.model('Achievement', AchievementSchema);
