var express = require('express');
var router = express.Router();


// Require our controllers.
var items_controller = require('../controllers/itemsController'); 
var category_controller = require('../controllers/categoryController');

/// BOOK ROUTES ///

// GET catalog home page.
router.get('/', items_controller.index);  




// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/items/create', items_controller.items_create_get);

// POST request for creating Book.
router.post('/items/create', items_controller.items_create_post);

// GET request to delete Book.
router.get('/items/:id/delete', items_controller.items_delete_get);

// POST request to delete Book.
router.post('/items/:id/delete', items_controller.items_delete_post);

// GET request to update Book.
router.get('/items/:id/update', items_controller.items_update_get);

// POST request to update Book.
router.post('/items/:id/update', items_controller.items_update_post);


// GET request for one Book.
router.get('/items/:id', items_controller.items_detail);

// GET request for list of all Book.
router.get('/items', items_controller.items_list);

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/category/create', category_controller.category_create_get);

// POST request for creating Genre.
router.post('/category/create', category_controller.category_create_post);

// GET request to delete Genre.
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete Genre.
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update Genre.
router.get('/category/:id/update', category_controller.category_update_get);

// POST request to update Genre.
router.post('/category/:id/update', category_controller.category_update_post);

// GET request for one Book.
router.get('/category/:id', category_controller.category_detail);

// GET request for list of all Book.
router.get('/category', category_controller.category_list);


module.exports = router;