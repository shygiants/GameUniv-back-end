var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
var User = mongoose.model('User');

var types = 'score text achievement'.split(' ');

var MomentSchema = new Schema({
  content: { type: String },
  type: { type: String, required: true, enum: types, index: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  game: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
  achievement: { type: Schema.Types.ObjectId, ref: 'Achievement' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

function populationForMoment() {
  var population = [];
  population.push({
    path: 'author',
    select: '-hashedPassword -havePlayed -following -developed -profilePhoto'
  });
  population.push({
    path: 'game',
    select: '-gameSecret -gameIcon -achievements'
  });
  population.push({
    path: 'achievement',
    select: '-icon'
  });

  return population;
}

MomentSchema.statics = {
  post: function(content, type, userId, gameId, achievementId) {
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
  postAchievement: function(achievementId, type, userId, gameId) {
    var posted = new this({
      type: type,
      author: new ObjectId(userId),
      game: new ObjectId(gameId),
      achievement: new ObjectId(achievementId)
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
      .populate(populationForMoment())
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
      Moment.find({ game: { $in: user.havePlayed } })
      .populate(populationForMoment())
      .sort({ created_at: -1 })
      .exec(function(err, moments) {
        if (err) reject(err);
        else if (moments) resolve(moments);
        else reject();
      });
    });
  },
  getTimelineForUser: function(userId) {
    var Moment = this;
    return new Promise(function(resolve, reject) {
      Moment.find({ author: userId })
      .populate(populationForMoment())
      .sort({ created_at: -1 })
      .exec(function(err, moments) {
        if (err) reject(err);
        else if (moments) resolve(moments);
        else reject();
      });
    });
  },
  getTimelineForGame: function(gameId) {
    var Moment = this;
    return new Promise(function(resolve, reject) {
      Moment.find({ game: new ObjectId(gameId) })
      .populate(populationForMoment())
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
