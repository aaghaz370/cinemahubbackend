const express = require('express');
const router = express.Router();
const migrationController = require('../controllers/migration.controller');
const testController = require('../controllers/test.controller');

// Trigger migration (Run once to populate existing data)
router.post('/migrate/tmdb-extras', migrationController.migrateTmdbExtras);

// Check migration status
router.get('/migrate/status', migrationController.getMigrationStatus);

// Test TMDB data (Debug)
router.get('/test/tmdb', testController.testTmdbData);

// Test manual save (Debug)
router.post('/test/save', testController.testManualSave);

module.exports = router;
