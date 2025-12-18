const express = require("express");
const router = express.Router();

const {
  // EPISODE (already existing)
  addWatchServer,
  updateWatchServer,
  deleteWatchServer,

  addDownloadQuality,
  deleteDownloadQuality,
  addDownloadServer,
  updateDownloadServer,
  deleteDownloadServer,

  // SEASON (NEW)
  addSeasonDownloadQuality,
  deleteSeasonDownloadQuality,
  addSeasonDownloadServer,
  updateSeasonDownloadServer,
  deleteSeasonDownloadServer

} = require("../controllers/admin.series.v2.controller");

/* ===================== EPISODE WATCH ===================== */
router.post("/admin/v2/episode/:episodeId/watch", addWatchServer);
router.put("/admin/v2/episode/:episodeId/watch", updateWatchServer);
router.delete("/admin/v2/episode/:episodeId/watch", deleteWatchServer);

/* ===================== EPISODE DOWNLOAD ===================== */
router.post("/admin/v2/episode/:episodeId/download/quality", addDownloadQuality);
router.delete("/admin/v2/episode/:episodeId/download/quality", deleteDownloadQuality);

router.post("/admin/v2/episode/:episodeId/download/server", addDownloadServer);
router.put("/admin/v2/episode/:episodeId/download/server", updateDownloadServer);
router.delete("/admin/v2/episode/:episodeId/download/server", deleteDownloadServer);

/* ===================== SEASON DOWNLOAD (NEW) ===================== */
router.post(
  "/admin/v2/season/:seasonId/download/quality",
  addSeasonDownloadQuality
);

router.delete(
  "/admin/v2/season/:seasonId/download/quality",
  deleteSeasonDownloadQuality
);

router.post(
  "/admin/v2/season/:seasonId/download/server",
  addSeasonDownloadServer
);

router.put(
  "/admin/v2/season/:seasonId/download/server",
  updateSeasonDownloadServer
);

router.delete(
  "/admin/v2/season/:seasonId/download/server",
  deleteSeasonDownloadServer
);

module.exports = router;
