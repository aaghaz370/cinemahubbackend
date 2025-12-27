const express = require("express");
const router = express.Router();
const { authenticate, checkPermission } = require("../middleware/auth.middleware");

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

/* ===================== EPISODE WATCH - Protected ===================== */
router.post("/admin/v2/episode/:episodeId/watch",
  authenticate,
  checkPermission('series_edit'),
  addWatchServer
);

router.put("/admin/v2/episode/:episodeId/watch",
  authenticate,
  checkPermission('series_edit'),
  updateWatchServer
);

router.delete("/admin/v2/episode/:episodeId/watch",
  authenticate,
  checkPermission('series_delete'),
  deleteWatchServer
);

/* ===================== EPISODE DOWNLOAD - Protected ===================== */
router.post("/admin/v2/episode/:episodeId/download/quality",
  authenticate,
  checkPermission('series_edit'),
  addDownloadQuality
);

router.delete("/admin/v2/episode/:episodeId/download/quality",
  authenticate,
  checkPermission('series_delete'),
  deleteDownloadQuality
);

router.post("/admin/v2/episode/:episodeId/download/server",
  authenticate,
  checkPermission('series_edit'),
  addDownloadServer
);

router.put("/admin/v2/episode/:episodeId/download/server",
  authenticate,
  checkPermission('series_edit'),
  updateDownloadServer
);

router.delete("/admin/v2/episode/:episodeId/download/server",
  authenticate,
  checkPermission('series_delete'),
  deleteDownloadServer
);

/* ===================== SEASON DOWNLOAD - Protected ===================== */
router.post(
  "/admin/v2/season/:seasonId/download/quality",
  authenticate,
  checkPermission('series_edit'),
  addSeasonDownloadQuality
);

router.delete(
  "/admin/v2/season/:seasonId/download/quality",
  authenticate,
  checkPermission('series_delete'),
  deleteSeasonDownloadQuality
);

router.post(
  "/admin/v2/season/:seasonId/download/server",
  authenticate,
  checkPermission('series_edit'),
  addSeasonDownloadServer
);

router.put(
  "/admin/v2/season/:seasonId/download/server",
  authenticate,
  checkPermission('series_edit'),
  updateSeasonDownloadServer
);

router.delete(
  "/admin/v2/season/:seasonId/download/server",
  authenticate,
  checkPermission('series_delete'),
  deleteSeasonDownloadServer
);

module.exports = router;
