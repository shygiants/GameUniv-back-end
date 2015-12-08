var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
var User = mongoose.model('User');

var types = 'score text'.split(' ');

var MomentSchema = new Schema({
  content: { type: String, required: true },
  type: { type: String, required: true, enum: types},
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  game: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

MomentSchema.statics = {
  post: function(content, type, userId, gameId) {
    var posted = new this({
      content: content,
      type: type,
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
      .populate('author', '-hashedPassword -developed -profilePhoto')
      .populate('game', '-gameSecret -gameIcon')
      .exec(function(err, moment) {
        if (err) reject(err);
        else if (moment) {
          Moment.populate(moments, {
            path: 'author.havePlayed',
            model: 'Game'
          }, function(err, moments) {
            if (err) reject(err);
            else resolve(moments);
          });
        } else reject();
      });
    });
  },
  getFeed: function(user) {
    var Moment = this;
    return new Promise(function(resolve, reject) {
      Moment.find({ game: { $in: user.havePlayed } })
      .populate('author', '-hashedPassword -developed -profilePhoto')
      .populate('game', '-gameSecret -gameIcon')
      .sort({ created_at: -1 })
      .exec(function(err, moments) {
        if (err) reject(err);
        else if (moments) {
          Moment.populate(moments, {
            path: 'author.havePlayed',
            model: 'Game'
          }, function(err, moments) {
            if (err) reject(err);
            else resolve(moments);
          });
        } else reject();
      });
    });
  },
  getTimelineForUser: function(user) {
    var Moment = this;
    return new Promise(function(resolve, reject) {
      Moment.find({ author: user._id })
      .populate('author', '-hashedPassword -developed -profilePhoto')
      .populate('game', '-gameSecret -gameIcon')
      .sort({ created_at: -1 })
      .exec(function(err, moments) {
        if (err) reject(err);
        else if (moments) {
          Moment.populate(moments, {
            path: 'author.havePlayed',
            model: 'Game'
          }, function(err, moments) {
            if (err) reject(err);
            else resolve(moments);
          });
        } else reject();
      });
    });
  },
  getTimelineForGame: function(gameId) {
    var Moment = this;
    return new Promise(function(resolve, reject) {
      Moment.find({ game: new ObjectId(gameId) })
      .populate('author', '-hashedPassword -developed -profilePhoto')
      .populate('game', '-gameSecret -gameIcon')
      .sort({ created_at: -1 })
      .exec(function(err, moments) {
        if (err) reject(err);
        else if (moments) {
          Moment.populate(moments, {
            path: 'author.havePlayed',
            model: 'Game'
          }, function(err, moments) {
            if (err) reject(err);
            else resolve(moments);
          });
        } else reject();
      });
    });
  }
};

mongoose.model('Moment', MomentSchema);
