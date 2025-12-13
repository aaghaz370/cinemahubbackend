const express = require("express");
const router = express.Router();
const { getUnifiedContent } = require("../controllers/content.controller");

router.get("/content", getUnifiedContent);

module.exports = router;
