const express = require('express');
const router = express.Router();

const {
    getVideos,
    getVideoInfo,
    renameVideo,
    deleteVideo,
    remoteUpload,
    getUploadUrl
} = require('../controllers/abyss.controller');

// Get all videos
router.get('/admin/abyss/videos', getVideos);

// Get video info
router.get('/admin/abyss/videos/:id', getVideoInfo);

// Rename video
router.put('/admin/abyss/videos/:id', renameVideo);

// Delete video
router.delete('/admin/abyss/videos/:id', deleteVideo);

// Remote upload
router.post('/admin/abyss/remote', remoteUpload);

// Get upload URL
router.get('/admin/abyss/upload-url', getUploadUrl);

module.exports = router;
