var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemsSchema = new Schema ({
    name: {type: String, required: true, max: 100},
    description: {type: String, required: true},
    category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
    price: {type: String, required: true},
    num_in_stock: {type: String, required: true}
})

ItemsSchema.virtual('url').get(function() {
    return '/catalog/items/' + (this._id.toString());
});

module.exports = mongoose.model('Items', ItemsSchema);