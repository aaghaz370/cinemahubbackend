const express = require('express');
const router = express.Router();

const {
    // Account
    getAccountInfo,

    // Files
    listFolder,
    getFileInfo,
    renameFile,
    moveFile,
    deleteFile,
    getThumbnail,

    // Folders
    createFolder,
    renameFolder,
    deleteFolder,

    // Upload
    getUploadUrl,

    // Remote Upload
    addRemoteUpload,
    getRemoteStatus,
    removeRemoteUpload,

    // Converts
    getRunningConverts,
    getFailedConverts
} = require('../controllers/streamtape.controller');

// ==================== ACCOUNT ====================
router.get('/admin/streamtape/account/info', getAccountInfo);

// ==================== FILES ====================
router.get('/admin/streamtape/files', listFolder);
router.get('/admin/streamtape/file/info', getFileInfo);
router.post('/admin/streamtape/file/rename', renameFile);
router.post('/admin/streamtape/file/move', moveFile);
router.post('/admin/streamtape/file/delete', deleteFile);
router.get('/admin/streamtape/file/thumbnail', getThumbnail);

// ==================== FOLDERS ====================
router.post('/admin/streamtape/folder/create', createFolder);
router.post('/admin/streamtape/folder/rename', renameFolder);
router.post('/admin/streamtape/folder/delete', deleteFolder);

// ==================== UPLOAD ====================
router.get('/admin/streamtape/upload/url', getUploadUrl);

// ==================== REMOTE UPLOAD ====================
router.post('/admin/streamtape/remote/add', addRemoteUpload);
router.get('/admin/streamtape/remote/status', getRemoteStatus);
router.post('/admin/streamtape/remote/remove', removeRemoteUpload);

// ==================== CONVERTS ====================
router.get('/admin/streamtape/converts/running', getRunningConverts);
router.get('/admin/streamtape/converts/failed', getFailedConverts);

module.exports = router;
