const express = require("express");
const router = express.Router();

// const auth = require("../middlewares/auth.middleware");

const {
  addMovie,
  updateMovie,
  deleteMovie,
  toggleTheatre,
  toggleHeroBanner
} = require("../controllers/admin.movie.controller");

// 🔐 ADMIN PROTECTED ROUTES
// router.post("/admin/movie", auth, addMovie);
// router.put("/admin/movie/:id", auth, updateMovie);
// router.delete("/admin/movie/:id", auth, deleteMovie);
router.post("/admin/movie", addMovie);
router.put("/admin/movie/:id", updateMovie);
router.delete("/admin/movie/:id", deleteMovie);

// 🎬 Theatre Toggle
router.patch("/admin/movie/:id/theatre", toggleTheatre);

// ⭐ Hero Banner Toggle
router.patch("/admin/movie/:id/hero", toggleHeroBanner);

module.exports = router;



