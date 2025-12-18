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
} = require("../controllers/admin.series.v2.controller");

/* WATCH (Episode) */
router.post("/admin/v2/episode/:episodeId/watch", addWatchServer);
router.put("/admin/v2/episode/:episodeId/watch", updateWatchServer);
router.delete("/admin/v2/episode/:episodeId/watch", deleteWatchServer);

/* DOWNLOAD (Episode) */
router.post("/admin/v2/episode/:episodeId/download/quality", addDownloadQuality);
router.delete("/admin/v2/episode/:episodeId/download/quality", deleteDownloadQuality);

router.post("/admin/v2/episode/:episodeId/download/server", addDownloadServer);
router.put("/admin/v2/episode/:episodeId/download/server", updateDownloadServer);
router.delete("/admin/v2/episode/:episodeId/download/server", deleteDownloadServer);

module.exports = router;
