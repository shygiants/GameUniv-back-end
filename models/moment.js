var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var MomentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  game: { type: Schema.Types.ObjectId, ref: 'Game', required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

MomentSchema.statics = {
  post: function(content, userId, gameId) {
    console.log('shy');
    // console.log(userId);
    // console.log(gameId);
    var posted = new this({
      content: content,
      author: new ObjectId(userId),
      game: new ObjectId(gameId)
    });

    return new Promise(function(resolve, reject) {
      posted.save(function(err, moment) {
        if (err) reject(err);
        else if (moment) resolve(moment);
      });
    });
  }
};

mongoose.model('Moment', MomentSchema);
