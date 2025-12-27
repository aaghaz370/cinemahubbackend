const express = require("express");
const router = express.Router();
const { authenticate, checkPermission } = require("../middleware/auth.middleware");

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

/* WATCH - Protected */
router.post("/admin/v2/movie/:id/watch",
  authenticate,
  checkPermission('movies_edit'),
  addWatchServer
);

router.put("/admin/v2/movie/:id/watch",
  authenticate,
  checkPermission('movies_edit'),
  updateWatchServer
);

router.delete("/admin/v2/movie/:id/watch",
  authenticate,
  checkPermission('movies_delete'),
  deleteWatchServer
);

/* DOWNLOAD - Protected */
router.post("/admin/v2/movie/:id/download/quality",
  authenticate,
  checkPermission('movies_edit'),
  addDownloadQuality
);

router.delete("/admin/v2/movie/:id/download/quality",
  authenticate,
  checkPermission('movies_delete'),
  deleteDownloadQuality
);

router.post("/admin/v2/movie/:id/download/server",
  authenticate,
  checkPermission('movies_edit'),
  addDownloadServer
);

router.put("/admin/v2/movie/:id/download/server",
  authenticate,
  checkPermission('movies_edit'),
  updateDownloadServer
);

router.delete("/admin/v2/movie/:id/download/server",
  authenticate,
  checkPermission('movies_delete'),
  deleteDownloadServer
);

module.exports = router;
