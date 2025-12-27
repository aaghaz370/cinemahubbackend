const express = require("express");
const router = express.Router();

const {
  addWatchServer,
  updateWatchServer,
  deleteWatchServer,
  addDownloadQuality,
  deleteDownloadQuality,
  addDownloadServer,
  updateDownloadServer,
  deleteDownloadServer
} = require("../controllers/admin.movie.v2.controller");

/* WATCH */
router.post("/admin/v2/movie/:id/watch", addWatchServer);
router.put("/admin/v2/movie/:id/watch", updateWatchServer);
router.delete("/admin/v2/movie/:id/watch", deleteWatchServer);

/* DOWNLOAD */
router.post("/admin/v2/movie/:id/download/quality", addDownloadQuality);
router.delete("/admin/v2/movie/:id/download/quality", deleteDownloadQuality);

router.post("/admin/v2/movie/:id/download/server", addDownloadServer);
router.put("/admin/v2/movie/:id/download/server", updateDownloadServer);
router.delete("/admin/v2/movie/:id/download/server", deleteDownloadServer);

module.exports = router;
