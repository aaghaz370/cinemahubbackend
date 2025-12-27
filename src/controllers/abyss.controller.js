const axios = require('axios');

const API_KEY = 'bae3b7ed62104a5c863a3c152c3ce8ba';
const API_BASE = 'https://api.abyss.to/v1';
const UPLOAD_URL = 'https://up.abyss.to';

// For READ operations (GET) - use query param
const readApi = axios.create({
    baseURL: API_BASE,
    params: { key: API_KEY },
    headers: { 'Content-Type': 'application/json' }
});

// For WRITE operations (POST, PUT, DELETE, PATCH) - use Bearer token
const writeApi = axios.create({
    baseURL: API_BASE,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
});

// ==================== RESOURCES ====================
exports.getResources = async (req, res) => {
    try {
        const { q = '', folderId = '', maxResults = 100, pageToken = '' } = req.query;
        const response = await readApi.get('/resources', {
            params: { q, folderId, maxResults, pageToken, orderBy: 'createdAt:desc' }
        });
        res.json(response.data);
    } catch (error) {
        console.error('❌ Resources:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
};

exports.getQuota = async (req, res) => {
    try {
        const response = await readApi.get('/about');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Quota:', error.response?.status);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

// ==================== FILES ====================
exports.getFileInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await readApi.get(`/files/${id}`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.renameFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        console.log('✏️ Rename file:', id, '->', name);

        const response = await writeApi.put(`/files/${id}`, { name });
        console.log('✅ Renamed');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Rename:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
};

exports.moveFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;
        const url = `/files/${id}?parentId=${parentId || ''}`;
        const response = await writeApi.patch(url);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Delete file:', id);
        const response = await writeApi.delete(`/files/${id}`);
        console.log('✅ Deleted');
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Delete:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
};

// ==================== FOLDERS ====================
exports.createFolder = async (req, res) => {
    try {
        const { name, parentId } = req.body;
        console.log('📁 Create folder:', name);

        const response = await writeApi.post('/folders', { name, parentId });
        console.log('✅ Created');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Create folder:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
};

exports.getFolders = async (req, res) => {
    try {
        const { q = '', folderId = '', maxResults = 100, pageToken = '' } = req.query;
        const response = await readApi.get('/folders/list', {
            params: { q, folderId, maxResults, pageToken }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.getFolderInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await readApi.get(`/folders/${id}`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.renameFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const response = await writeApi.put(`/folders/${id}`, { name });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.moveFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;
        const url = `/folders/${id}?parentId=${parentId || ''}`;
        const response = await writeApi.patch(url);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await writeApi.delete(`/folders/${id}`);
        res.json({ success: true });
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

// ==================== REMOTE UPLOAD ====================
exports.remoteUploadGD = async (req, res) => {
    try {
        const { fileId, folderName, parentId } = req.body;
        console.log('📥 Remote GD:', fileId);

        let url = `/remote/${fileId}`;
        if (folderName) {
            url = `/remote/${fileId}/folder?name=${encodeURIComponent(folderName)}`;
            if (parentId) url += `&parentId=${parentId}`;
        }

        const response = await writeApi.post(url);
        console.log('✅ Remote started');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Remote:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
};

// ==================== SUBTITLES ====================
exports.getSubtitles = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await readApi.get(`/subtitles/${id}/list`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.deleteSubtitle = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await writeApi.delete(`/subtitles/${id}`);
        res.json({ success: true });
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

// ==================== UPLOAD ====================
exports.getUploadUrl = async (req, res) => {
    try {
        res.json({
            uploadUrl: `${UPLOAD_URL}/${API_KEY}`,
            apiKey: API_KEY
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================== TEST ====================
exports.testConnection = async (req, res) => {
    try {
        const response = await readApi.get('/about');
        res.json({
            success: true,
            message: '✅ Connected!',
            quota: response.data
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
};
