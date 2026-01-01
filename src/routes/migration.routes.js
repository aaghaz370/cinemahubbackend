const express = require('express');
const router = express.Router();
const migrationController = require('../controllers/migration.controller');

// Trigger migration (Run once to populate existing data)
router.post('/migrate/tmdb-extras', migrationController.migrateTmdbExtras);

// Check migration status
router.get('/migrate/status', migrationController.getMigrationStatus);

module.exports = router;
