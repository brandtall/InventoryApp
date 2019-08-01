#! /usr/bin/env node

console.log('is this gonna work or not?');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Items = require('./models/items')
var Category = require('./models/category')



var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var itemsArray = []
var categories = []

function ItemsCreate(name, des, cat, price, num_in_stock, cb) {
  itemsdetail = {name:name , description:des, category:cat, price:price, num_in_stock:num_in_stock};
  
  var items = new Items(itemsdetail);
       
  items.save(function (err) {
    if (err) {
      cb(err, null)
      return console.log(itemsdetail);
    }
    console.log('New items: ' + items);
    itemsArray.push(items)
    cb(null, items)
  }  );
}

function categoriesCreate(name, description, cb) {
  var category = new Category({ name: name, description: description });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return console.log('check category');
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function createCategories(cb) {
    async.parallel([
        function(callback) {
            categoriesCreate('Consumables', 'Like drinks', callback)},
        function(callback) {
            categoriesCreate('Tools', 'Handy', callback)},
        function(callback) {
            categoriesCreate('Accessories', 'Shiny', callback)},

        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.series([
        function(callback) {
            ItemsCreate('Apple', 'Fruit', categories[0], '2$', '82', callback)
        },
        function(callback) {
            ItemsCreate('Oranges', 'fghj', categories[0], '2$', '32', callback)
        },
        function(callback) {
            ItemsCreate('Knife', 'Sharp', categories[1], '21$', '15', callback)
        },
        function(callback) {
            ItemsCreate('Orange Juice', 'Drink', categories[0], '13$', '8', callback)
        },
        function(callback) {
            ItemsCreate('Toothpick', 'Useful', categories[1], '1$', '10', callback)
        },
        function(callback) {
            ItemsCreate('Ring', 'Jewelry', categories[2], '700$', '2', callback)
        }
        ],
        // optional callback
        cb);
}






async.series([
    createCategories,
    createItems
],
// Optional callback
function(err) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



