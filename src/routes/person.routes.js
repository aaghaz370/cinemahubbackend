const express = require("express");
const router = express.Router();
const { getPersonDetail } = require("../controllers/person.controller");

router.get("/person/:tmdbId", getPersonDetail);

module.exports = router;
