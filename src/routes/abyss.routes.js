const express = require('express');
const router = express.Router();
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

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

    // Subtitles
    getSubtitles,
    deleteSubtitle,

    // Upload
    getUploadUrl,

    // Test
    testConnection
} = require('../controllers/abyss.controller');

// Test endpoint to check API connectivity
router.get('/admin/abyss/test', async (req, res) => {
    const axios = require('axios');
    const API_KEY = 'bae3b7ed62104a5c863a3c152c3ce8ba';

    try {
        // Test basic resources call
        const response = await axios.get(`https://api.abyss.to/v1/resources?key=${API_KEY}&maxResults=5`);
        res.json({
            success: true,
            message: 'Abyss API is working!',
            data: response.data,
            status: response.status
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data,
            fullError: error.toString()
        });
    }
});

// ==================== RESOURCES ====================
router.get('/admin/abyss/resources', authenticate, checkPermission('abyss_view'), getResources);
router.get('/admin/abyss/quota', authenticate, checkPermission('abyss_view'), getQuota);

// ==================== FILES ====================
router.get('/admin/abyss/files/:id', authenticate, checkPermission('abyss_view'), getFileInfo);
router.put('/admin/abyss/files/:id', authenticate, checkPermission('abyss_upload'), renameFile);
router.patch('/admin/abyss/files/:id/move', authenticate, checkPermission('abyss_upload'), moveFile);
router.delete('/admin/abyss/files/:id', authenticate, checkPermission('abyss_delete'), deleteFile);

// ==================== FOLDERS ====================
router.post('/admin/abyss/folders', authenticate, checkPermission('abyss_upload'), createFolder);
router.get('/admin/abyss/folders', authenticate, checkPermission('abyss_view'), getFolders);
router.get('/admin/abyss/folders/:id', authenticate, checkPermission('abyss_view'), getFolderInfo);
router.put('/admin/abyss/folders/:id', authenticate, checkPermission('abyss_upload'), renameFolder);
router.patch('/admin/abyss/folders/:id/move', authenticate, checkPermission('abyss_upload'), moveFolder);
router.delete('/admin/abyss/folders/:id', authenticate, checkPermission('abyss_delete'), deleteFolder);

// ==================== REMOTE UPLOAD ====================
router.post('/admin/abyss/remote/google-drive', authenticate, checkPermission('abyss_upload'), remoteUploadGD);

// ==================== SUBTITLES ====================
router.get('/admin/abyss/subtitles/:id', authenticate, checkPermission('abyss_view'), getSubtitles);
router.delete('/admin/abyss/subtitles/:id', authenticate, checkPermission('abyss_delete'), deleteSubtitle);

// ==================== UPLOAD ====================
router.get('/admin/abyss/upload-url', authenticate, checkPermission('abyss_upload'), getUploadUrl);

module.exports = router;
