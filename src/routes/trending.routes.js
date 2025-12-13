const express = require("express");
const router = express.Router();
const { getTrending } = require("../controllers/trending.controller");

router.get("/trending", getTrending);

module.exports = router;
