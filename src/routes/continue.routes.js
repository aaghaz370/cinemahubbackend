const express = require("express");
const router = express.Router();
const {
  saveProgress,
  getContinueWatching
} = require("../controllers/continue.controller");

router.post("/continue", saveProgress);
router.get("/continue/:userId", getContinueWatching);

module.exports = router;
