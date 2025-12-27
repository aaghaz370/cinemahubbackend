const express = require('express');
const router = express.Router();
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

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
router.get('/admin/streamtape/account/info', authenticate, checkPermission('streamtape_view'), getAccountInfo);

// ==================== FILES ====================
router.get('/admin/streamtape/files', authenticate, checkPermission('streamtape_view'), listFolder);
router.get('/admin/streamtape/file/info', authenticate, checkPermission('streamtape_view'), getFileInfo);
router.post('/admin/streamtape/file/rename', authenticate, checkPermission('streamtape_upload'), renameFile);
router.post('/admin/streamtape/file/move', authenticate, checkPermission('streamtape_upload'), moveFile);
router.post('/admin/streamtape/file/delete', authenticate, checkPermission('streamtape_delete'), deleteFile);
router.get('/admin/streamtape/file/thumbnail', authenticate, checkPermission('streamtape_view'), getThumbnail);

// ==================== FOLDERS ====================
router.post('/admin/streamtape/folder/create', authenticate, checkPermission('streamtape_upload'), createFolder);
router.post('/admin/streamtape/folder/rename', authenticate, checkPermission('streamtape_upload'), renameFolder);
router.post('/admin/streamtape/folder/delete', authenticate, checkPermission('streamtape_delete'), deleteFolder);

// ==================== UPLOAD ====================
router.get('/admin/streamtape/upload/url', authenticate, checkPermission('streamtape_upload'), getUploadUrl);

// ==================== REMOTE UPLOAD ====================
router.post('/admin/streamtape/remote/add', authenticate, checkPermission('streamtape_upload'), addRemoteUpload);
router.get('/admin/streamtape/remote/status', authenticate, checkPermission('streamtape_view'), getRemoteStatus);
router.post('/admin/streamtape/remote/remove', authenticate, checkPermission('streamtape_delete'), removeRemoteUpload);

// ==================== CONVERTS ====================
router.get('/admin/streamtape/converts/running', authenticate, checkPermission('streamtape_view'), getRunningConverts);
router.get('/admin/streamtape/converts/failed', authenticate, checkPermission('streamtape_view'), getFailedConverts);

module.exports = router;
