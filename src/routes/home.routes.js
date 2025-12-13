const express = require("express");
const router = express.Router();
const { homeSections } = require("../controllers/home.controller");

router.get("/home", homeSections);

module.exports = router;
