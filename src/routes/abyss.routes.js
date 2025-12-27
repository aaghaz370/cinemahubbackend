const express = require('express');
const router = express.Router();

const {
    // Resources
    getResources,
    getQuota,

    // Files
    getFileInfo,
    renameFile,
    moveFile,
    deleteFile,

    // Folders
    createFolder,
    getFolders,
    getFolderInfo,
    renameFolder,
    moveFolder,
    deleteFolder,

    // Remote Upload
    remoteUploadGD,
    remoteUploadUrl,

    // Subtitles
    getSubtitles,
    deleteSubtitle,

    // Upload
    getUploadUrl
} = require('../controllers/abyss.controller');

// ==================== RESOURCES ====================
router.get('/admin/abyss/resources', getResources);
router.get('/admin/abyss/quota', getQuota);

// ==================== FILES ====================
router.get('/admin/abyss/files/:id', getFileInfo);
router.put('/admin/abyss/files/:id', renameFile);
router.patch('/admin/abyss/files/:id/move', moveFile);
router.delete('/admin/abyss/files/:id', deleteFile);

// ==================== FOLDERS ====================
router.post('/admin/abyss/folders', createFolder);
router.get('/admin/abyss/folders', getFolders);
router.get('/admin/abyss/folders/:id', getFolderInfo);
router.put('/admin/abyss/folders/:id', renameFolder);
router.patch('/admin/abyss/folders/:id/move', moveFolder);
router.delete('/admin/abyss/folders/:id', deleteFolder);

// ==================== REMOTE UPLOAD ====================
router.post('/admin/abyss/remote/google-drive', remoteUploadGD);
router.post('/admin/abyss/remote/url', remoteUploadUrl);

// ==================== SUBTITLES ====================
router.get('/admin/abyss/subtitles/:id', getSubtitles);
router.delete('/admin/abyss/subtitles/:id', deleteSubtitle);

// ==================== UPLOAD ====================
router.get('/admin/abyss/upload-url', getUploadUrl);

module.exports = router;
