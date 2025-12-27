const express = require('express');
const router = express.Router();

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
router.get('/admin/voe/account/info', getAccountInfo);
router.get('/admin/voe/account/stats', getAccountStats);

// ==================== UPLOAD ====================
router.get('/admin/voe/upload/server', getUploadServer);
router.post('/admin/voe/upload/remote', remoteUpload);
router.get('/admin/voe/upload/remote/list', getRemoteUploads);

// ==================== FILES ====================
router.get('/admin/voe/files', getFiles);
router.get('/admin/voe/file/info', getFileInfo);
router.post('/admin/voe/file/rename', renameFile);
router.post('/admin/voe/file/delete', deleteFile);
router.post('/admin/voe/file/move', moveFile);

// ==================== FOLDERS ====================
router.get('/admin/voe/folders', getFolders);
router.post('/admin/voe/folder/create', createFolder);
router.post('/admin/voe/folder/rename', renameFolder);

// ==================== CLONE ====================
router.post('/admin/voe/file/clone', cloneFile);

module.exports = router;
