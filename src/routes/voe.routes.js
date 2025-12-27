const express = require('express');
const router = express.Router();
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const {
    // Account
    getAccountInfo,
    getAccountStats,

    // Upload
    getUploadServer,
    remoteUpload,
    getRemoteUploads,

    // Files
    getFiles,
    getFileInfo,
    renameFile,
    deleteFile,
    moveFile,

    // Folders
    getFolders,
    createFolder,
    renameFolder,

    // Clone
    cloneFile
} = require('../controllers/voe.controller');

// ==================== ACCOUNT ====================
router.get('/admin/voe/account/info', authenticate, checkPermission('voe_view'), getAccountInfo);
router.get('/admin/voe/account/stats', authenticate, checkPermission('voe_view'), getAccountStats);

// ==================== UPLOAD ====================
router.get('/admin/voe/upload/server', authenticate, checkPermission('voe_upload'), getUploadServer);
router.post('/admin/voe/upload/remote', authenticate, checkPermission('voe_upload'), remoteUpload);
router.get('/admin/voe/upload/remote/list', authenticate, checkPermission('voe_view'), getRemoteUploads);

// ==================== FILES ====================
router.get('/admin/voe/files', authenticate, checkPermission('voe_view'), getFiles);
router.get('/admin/voe/file/info', authenticate, checkPermission('voe_view'), getFileInfo);
router.post('/admin/voe/file/rename', authenticate, checkPermission('voe_upload'), renameFile);
router.post('/admin/voe/file/delete', authenticate, checkPermission('voe_delete'), deleteFile);
router.post('/admin/voe/file/move', authenticate, checkPermission('voe_upload'), moveFile);

// ==================== FOLDERS ====================
router.get('/admin/voe/folders', authenticate, checkPermission('voe_view'), getFolders);
router.post('/admin/voe/folder/create', authenticate, checkPermission('voe_upload'), createFolder);
router.post('/admin/voe/folder/rename', authenticate, checkPermission('voe_upload'), renameFolder);

// ==================== CLONE ====================
router.post('/admin/voe/file/clone', authenticate, checkPermission('voe_upload'), cloneFile);

module.exports = router;
