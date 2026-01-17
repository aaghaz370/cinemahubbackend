const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/admin.collection.controller');

// Public Routes (for frontend to fetch collections)
router.get('/', collectionController.getAllCollections);
router.get('/:slug', collectionController.getCollectionBySlug);

// Admin Routes (protected - add auth middleware if needed)
router.post('/create', collectionController.createCollection);
router.put('/:id', collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);

// Item Management
router.post('/:id/items', collectionController.addItemToCollection);
router.delete('/:id/items/:itemId', collectionController.removeItemFromCollection);
router.post('/:id/items/bulk', collectionController.bulkAddItems);

module.exports = router;
