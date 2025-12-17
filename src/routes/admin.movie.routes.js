const express = require("express");
const router = express.Router();

const {
  addMovie,
  updateMovie,
  deleteMovie,

  addWatchServer,
  updateWatchServer,
  deleteWatchServer,

  addDownloadQuality,
  deleteDownloadQuality,
  addDownloadServer,
  updateDownloadServer,
  deleteDownloadServer
} = require("../controllers/admin.movie.controller");

/* ================= BASIC ================= */
router.post("/admin/movie", addMovie);
router.put("/admin/movie/:id", updateMovie);
router.delete("/admin/movie/:id", deleteMovie);

/* ================= WATCH ================= */
router.post("/admin/movie/:id/watch", addWatchServer);
router.put("/admin/movie/:id/watch", updateWatchServer);
router.delete("/admin/movie/:id/watch", deleteWatchServer);

/* ================= DOWNLOAD ================= */
router.post("/admin/movie/:id/download/quality", addDownloadQuality);
router.delete("/admin/movie/:id/download/quality", deleteDownloadQuality);

router.post("/admin/movie/:id/download/server", addDownloadServer);
router.put("/admin/movie/:id/download/server", updateDownloadServer);
router.delete("/admin/movie/:id/download/server", deleteDownloadServer);

module.exports = router;


