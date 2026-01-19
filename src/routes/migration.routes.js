const express = require('express');
const router = express.Router();
const migrationController = require('../controllers/migration.controller');
const testController = require('../controllers/test.controller');
const tmdbTestController = require('../controllers/tmdb.test.controller');

// Trigger migration (Run once to populate existing data)
router.post('/migrate/tmdb-extras', migrationController.migrateTmdbExtras);

// Check migration status
router.get('/migrate/status', migrationController.getMigrationStatus);

// Test TMDB API connection
router.get('/test/tmdb-connection', tmdbTestController.testTmdbConnection);

// Test TMDB data (Debug)
router.get('/test/tmdb', testController.testTmdbData);

// Test manual save (Debug)
router.post('/test/save', testController.testManualSave);

module.exports = router;
