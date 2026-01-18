const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actor.controller');

// Get actor by TMDB ID
router.get('/:actorId', actorController.getActorById);

// Search actors
router.get('/search', actorController.searchActors);

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Actor routes working!' });
});

// Sync actors from content (admin only - run once to populate)
router.post('/sync', actorController.syncActorsFromContent);

module.exports = router;
