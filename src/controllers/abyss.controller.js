const axios = require('axios');

const API_KEY = 'bae3b7ed62104a5c863a3c152c3ce8ba';
const API_BASE = 'https://api.abyss.to/v1';
const UPLOAD_URL = 'https://up.abyss.to';

// Helper to add API key to URL
const withKey = (url) => url + (url.includes('?') ? '&' : '?') + `key=${API_KEY}`;

// ==================== RESOURCES ====================
exports.getResources = async (req, res) => {
    try {
        const { q = '', folderId = '', maxResults = 100, pageToken = '' } = req.query;
        const response = await axios.get(withKey(`${API_BASE}/resources`), {
            params: { q, folderId, maxResults, pageToken, orderBy: 'createdAt:desc' }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getQuota = async (req, res) => {
    try {
        const response = await axios.get(withKey(`${API_BASE}/about`));
        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// ==================== FILES ====================
exports.getFileInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(withKey(`${API_BASE}/files/${id}`));
        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.renameFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        console.log('Rename file - ID:', id, 'Name:', name);

        const response = await axios.put(
            withKey(`${API_BASE}/files/${id}`),
            { name },
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Renamed successfully');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Rename error - Status:', error.response?.status, 'Data:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.moveFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;
        const response = await axios.patch(
            withKey(`${API_BASE}/files/${id}`) + `&parentId=${parentId || ''}`,
            {},
            { headers: { 'Content-Type': 'application/json' } }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Delete file - ID:', id);
        const response = await axios.delete(withKey(`${API_BASE}/files/${id}`));
        console.log('✅ Deleted successfully');
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Delete error - Status:', error.response?.status);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

// ==================== FOLDERS ====================
exports.createFolder = async (req, res) => {
    try {
        const { name, parentId } = req.body;
        console.log('Create folder - Name:', name, 'ParentID:', parentId);

        const response = await axios.post(
            withKey(`${API_BASE}/folders`),
            { name, parentId },
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Folder created');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Create folder error - Status:', error.response?.status);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.getFolders = async (req, res) => {
    try {
        const { q = '', folderId = '', maxResults = 100, pageToken = '' } = req.query;
        const response = await axios.get(withKey(`${API_BASE}/folders/list`), {
            params: { q, folderId, maxResults, pageToken }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getFolderInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(withKey(`${API_BASE}/folders/${id}`));
        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.renameFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const response = await axios.put(
            withKey(`${API_BASE}/folders/${id}`),
            { name },
            { headers: { 'Content-Type': 'application/json' } }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.moveFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;
        const response = await axios.patch(
            withKey(`${API_BASE}/folders/${id}`) + `&parentId=${parentId || ''}`,
            {},
            { headers: { 'Content-Type': 'application/json' } }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.delete(withKey(`${API_BASE}/folders/${id}`));
        res.json({ success: true });
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// ==================== REMOTE UPLOAD ====================
exports.remoteUploadGD = async (req, res) => {
    try {
        const { fileId } = req.body;
        console.log('Remote GD upload:', fileId);

        const response = await axios.post(
            withKey(`${API_BASE}/remote/${fileId}`),
            {},
            { headers: { 'Content-Type': 'application/json' } }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Remote upload error:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.remoteUploadUrl = async (req, res) => {
    try {
        const { url } = req.body;
        res.json({
            success: false,
            message: 'Direct URL upload requires manual action',
            instruction: 'Go to https://abyss.to/dashboard/d/upload → Remote Url tab',
            url: url
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================== SUBTITLES ====================
exports.getSubtitles = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(withKey(`${API_BASE}/subtitles/${id}/list`));
        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSubtitle = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.delete(withKey(`${API_BASE}/subtitles/${id}`));
        res.json({ success: true });
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
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
