const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actor.controller');

// Test endpoint (must come before /:actorId)
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Actor routes working!' });
});

// Search actors (must come before /:actorId)
router.get('/search', actorController.searchActors);

// Sync actors from content (admin only - run once to populate)
router.post('/sync', actorController.syncActorsFromContent);

// Get actor by TMDB ID (must be last - catches everything else)
router.get('/:actorId', actorController.getActorById);

module.exports = router;
