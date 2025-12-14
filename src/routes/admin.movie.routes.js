const express = require("express");
const router = express.Router();

// const auth = require("../middlewares/auth.middleware");

const {
  addMovie,
  updateMovie,
  deleteMovie
} = require("../controllers/admin.movie.controller");

// 🔐 ADMIN PROTECTED ROUTES
router.post("/admin/movie", auth, addMovie);
router.put("/admin/movie/:id", auth, updateMovie);
router.delete("/admin/movie/:id", auth, deleteMovie);

module.exports = router;


