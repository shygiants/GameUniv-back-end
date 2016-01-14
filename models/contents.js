var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var types = 'text image'.split(' ');

var ContentsSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    pages: [{
        type: { type: String, required: true, enum: types },
        image: String,
        description: { type: String, required: true }
    }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    game: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at'} });

ContentsSchema.statics = {
    create: function(title, description, imageFile, userId, gameId) {
        var Contents = this;
        return new Contents({
            title: title,
            description: description,
            image: imageFile.path,
            pages: [],
            author: new ObjectId(userId),
            game: new ObjectId(gameId)
        });
    }
};

ContentsSchema.methods = {
    addPages: function(pages, files) {
        for (var index in pages) {
            var page = pages[index];
            this.pages.push({
               type: page.type,
               image: files[page.imageNum].path,
               description: page.description
            });
        }
    }
};

mongoose.model('Contents', ContentsSchema);