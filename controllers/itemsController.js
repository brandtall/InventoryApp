var Items = require("../models/items");
var Category = require("../models/category");
var async = require("async");

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

exports.index = function(req, res) {
  async.parallel(
    {
      items_count: function(callback) {
        Items.count(callback);
      },
      category_count: function(callback) {
        Category.count(callback);
      }
    },
    function(err, results) {
      res.render("index", {
        title: "Inventory Home",
        error: err,
        data: results
      });
    }
  );
};

// Display list of all books.
exports.items_list = function(req, res, next) {
  Items.find({}, "name category ")
    .populate("category")
    .exec(function(err, list_items) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("items_list", { title: "Items List", items_list: list_items });
    });
};

// Display detail page for a specific book.
exports.items_detail = function(req, res, next) {
  async.parallel(
    {
      items: function(callback) {
        Items.findById(req.params.id)
          .populate("category")
          .exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.items == null) {
        // No results.
        var err = new Error("Items not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      console.log(results.items.category.url);
      res.render("items_detail", { name: "Name", items: results.items });
    }
  );
};

// Display book create form on GET.
exports.items_create_get = function(req, res, next) {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      category: function(callback) {
        Category.find(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      res.render("items_form", {
        title: "Create Item",
        category: results.category
      });
    }
  );
};

// Handle book create on POST.
exports.items_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Validate fields.
  body("name", "Name must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("description", "Description must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("price", "Price must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("num_in_stock", "Number in stock must not be empty")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize fields.
  sanitizeBody("*").escape(),
  sanitizeBody("category.*").escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var items = new Items({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      num_in_stock: req.body.num_in_stock
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          category: function(callback) {
            Category.find(callback);
          }
        },
        function(err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (let i = 0; i < results.category.length; i++) {
            if (items.category.indexOf(results.category[i]._id) > -1) {
              results.category[i].checked = "true";
            }
          }
          res.render("items_form", {
            title: "Create Item",
            category: results.category,
            items: items,
            errors: errors.array()
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save book.
      items.save(function(err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new book record.
        res.redirect(items.url);
      });
    }
  }
];

// Display book delete form on GET.
exports.items_delete_get = function(req, res, next) {
  async.parallel(
    {
      items: function(callback) {
        Items.findById(req.params.id)
          .populate("category")
          .exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.items == null) {
        // No results.
        res.redirect("/catalog/items");
      }
      // Successful, so render.
      res.render("items_delete", {
        title: "Delete Item",
        items: results.items
      });
    }
  );
};

// Handle book delete on POST.
exports.items_delete_post = function(req, res, next) {
  // Assume the post has valid id (ie no validation/sanitization).

  async.parallel(
    {
      items: function(callback) {
        Items.findById(req.body.id)
          .populate("category")
          .exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      // Success
      else {
        // Book has no BookInstance objects. Delete object and redirect to the list of books.
        Items.findByIdAndRemove(req.body.id, function deleteItems(err) {
          if (err) {
            return next(err);
          }
          // Success - got to books list.
          res.redirect("/catalog/items");
        });
      }
    }
  );
};

// Display book update form on GET.
exports.items_update_get = function(req, res, next) {
  // Get book, authors and genres for form.
  async.parallel(
    {
      items: function(callback) {
        Items.findById(req.params.id)
          .populate("category")
          .exec(callback);
      },
      category: function(callback) {
        Category.find(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.items == null) {
        // No results.
        var err = new Error("Items not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (
        var all_g_iter = 0;
        all_g_iter < results.category.length;
        all_g_iter++
      ) {
        for (
          var items_g_iter = 0;
          items_g_iter < results.items.category.length;
          items_g_iter++
        ) {
          if (
            results.category[all_g_iter]._id.toString() ==
            results.items.category[items_g_iter]._id.toString()
          ) {
            results.category[all_g_iter].checked = "true";
          }
        }
      }
      res.render("items_form", {
        title: "Update Item",
        category: results.category,
        items: results.items
      });
    }
  );
};

// Handle book update on POST.
exports.items_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Validate fields.
  body("name", "Name must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("description", "Description must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("price", "Price must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("num_in_stock", "Num_in_stock must not be empty")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize fields.
  sanitizeBody("name").escape(),
  sanitizeBody("description").escape(),
  sanitizeBody("category.*").escape(),
  sanitizeBody("price").escape(),
  sanitizeBody("num_in_stock").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    var items = new Items({
      name: req.body.name,
      description: req.body.description,
      category:
        typeof req.body.category === "undefined" ? [] : req.body.category,
      _id: req.params.id,
      price: req.body.price,
      num_in_stock: req.body.num_in_stock // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form
      async.parallel(
        {
          category: function(callback) {
            Category.find(callback);
          }
        },
        function(err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (let i = 0; i < results.category.length; i++) {
            if (items.category.indexOf(results.category[i]._id) > -1) {
              results.category[i].checked = "true";
            }
          }
          res.render("items_form", {
            title: "Update Item",
            category: results.category,
            items: items,
            errors: errors.array()
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Items.findByIdAndUpdate(req.params.id, items, {}, function(err, theitem) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.redirect(theitem.url);
      });
    }
  }
];
