var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: {type: String, required: true, max: 100},
    description: {type: String, required: true}
});

CategorySchema.virtual('url').get(function() {
    return '/catalog/category/' + (this._id.toString());
})

module.exports = mongoose.model('Category', CategorySchema)