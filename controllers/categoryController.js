var Category = require('../models/category');
var Items = require('../models/items');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
exports.category_list = function(req, res, next) {
  Category.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_categories) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('category_list', { title: 'Category List', list_categories:  list_categories});
    });

};

// Display detail page for a specific Genre.
exports.category_detail = function(req, res, next) {

    async.parallel({
        category: function(callback) {

            Category.findById(req.params.id)
              .exec(callback);
        },

        category_items: function(callback) {
          Items.find({ 'category': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.category_items } );
    });

};



// Display Genre create form on GET.
exports.category_create_get = function(req, res, next) {
  console.log('lol')
  res.render('category_form', { title: 'Create Category'});
};

// Handle Genre create on POST.
exports.category_create_post = [

  // Validate that the name field is not empty.
  body('name', 'Category name required').isLength({ min: 1 }).trim(),

  // Sanitize (trim) the name field.
  sanitizeBody('name').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a genre object with escaped and trimmed data.
      var category = new Category(
        { name: req.body.name }
      );

      if (!errors.isEmpty()) {
          // There are errors. Render the form again with sanitized values/error messages.
          res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
      return;
      }
      else {
          // Data from form is valid.
          // Check if Genre with same name already exists.
          Category.findOne({ 'name': req.body.name })
              .exec( function(err, found_category) {
                   if (err) { return next(err); }

                   if (found_category) {
                       // Genre exists, redirect to its detail page.
                       res.redirect(found_category.url);
                   }
                   else {

                       category.save(function (err) {
                         if (err) { return next(err); }
                         // Genre saved. Redirect to genre detail page.
                         res.redirect(category.url);
                       });

                   }

               });
      }
  }
];

// Display Genre delete form on GET.
exports.category_delete_get = function(req, res, next) {

  async.parallel({
      category: function(callback) {
          Category.findById(req.params.id).exec(callback);
      },
      category_items: function(callback) {
          Items.find({ 'category': req.params.id }).exec(callback);
      },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.category==null) { // No results.
          res.redirect('/catalog/category');
      }
      // Successful, so render.
      res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items } );
  });

};

// Handle Genre delete on POST.
exports.category_delete_post = function(req, res, next) {

  async.parallel({
      category: function(callback) {
          Category.findById(req.params.id).exec(callback);
      },
      category_items: function(callback) {
          Items.find({ 'category': req.params.id }).exec(callback);
      },
  }, function(err, results) {
      if (err) { return next(err); }
      // Success
      if (results.category_items.length > 0) {
          // Genre has books. Render in same way as for GET route.
          res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items } );
          return;
      }
      else {
          // Genre has no books. Delete object and redirect to the list of genres.
          Category.findByIdAndRemove(req.body.id, function deleteCategory(err) {
              if (err) { return next(err); }
              // Success - go to genres list.
              res.redirect('/catalog/category');
          });

      }
  });

};

// Display Genre update form on GET.
exports.category_update_get = function(req, res, next) {

  Category.findById(req.params.id, function(err, category) {
      if (err) { return next(err); }
      if (category==null) { // No results.
          var err = new Error('Category not found');
          err.status = 404;
          return next(err);
      }
      // Success.
      res.render('category_form', { title: 'Update Category', category: category });
  });

};

// Handle Genre update on POST.
exports.category_update_post = [
 
  // Validate that the name field is not empty.
  body('name', 'Category name required').isLength({ min: 1 }).trim(),
  
  // Sanitize (escape) the name field.
  sanitizeBody('name').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request .
      const errors = validationResult(req);

  // Create a genre object with escaped and trimmed data (and the old id!)
      var category = new Category(
        {
        name: req.body.name,
        _id: req.params.id
        }
      );


      if (!errors.isEmpty()) {
          // There are errors. Render the form again with sanitized values and error messages.
          res.render('category_form', { title: 'Update Category', category: category, errors: errors.array()});
      return;
      }
      else {
          // Data from form is valid. Update the record.
          Category.findByIdAndUpdate(req.params.id, category, {}, function (err,thecategory) {
              if (err) { return next(err); }
                 // Successful - redirect to genre detail page.
                 res.redirect(thecategory.url);
              });
      }
  }
];