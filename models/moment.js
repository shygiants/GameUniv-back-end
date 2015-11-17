var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
var User = mongoose.model('User');

var MomentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  game: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true }
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
  },
  getById: function(momentId) {
    var Moment = this;
    return new Promise(function(resolve, reject) {
      Moment.findOne({ _id: new ObjectId(momentId) })
      .populate('author', '-hashedPassword')
      .populate('game', '-gameSecret')
      .exec(function(err, moment) {
        if (err) reject(err);
        else if (moment) resolve(moment);
        else reject();
      });
    });
  },
  getFeed: function(user) {
    var Moment = this;
    return new Promise(function(resolve, reject) {
      Moment.find({ game: { $in: user.havePlayed } }, null)
      .populate('author', '-hashedPassword')
      .populate('game', '-gameSecret')
      .sort({ created_at: -1 })
      .exec(function(err, moments) {
        if (err) reject(err);
        else if (moments) resolve(moments);
        else reject();
      });
    });
  }
};

mongoose.model('Moment', MomentSchema);
