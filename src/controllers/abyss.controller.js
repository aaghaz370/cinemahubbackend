const axios = require('axios');

const API_KEY = 'bae3b7ed62104a5c863a3c152c3ce8ba';
const API_BASE = 'https://api.abyss.to/v1';
const UPLOAD_URL = 'https://up.abyss.to';

// Helper to add key to URL
const withKey = (url) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}key=${API_KEY}`;
};

// ==================== RESOURCES ====================
exports.getResources = async (req, res) => {
    try {
        const { q = '', folderId = '', maxResults = 100, pageToken = '' } = req.query;

        let url = `${API_BASE}/resources?key=${API_KEY}&maxResults=${maxResults}&orderBy=createdAt:desc`;
        if (q) url += `&q=${encodeURIComponent(q)}`;
        if (folderId) url += `&folderId=${folderId}`;
        if (pageToken) url += `&pageToken=${pageToken}`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('❌ Resources:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
};

exports.getQuota = async (req, res) => {
    try {
        const response = await axios.get(withKey(`${API_BASE}/about`));
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
        const response = await axios.get(withKey(`${API_BASE}/files/${id}`));
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.renameFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        console.log('✏️ Rename:', id, '->', name);

        const response = await axios.put(
            withKey(`${API_BASE}/files/${id}`),
            { name },
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Renamed!');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Rename error:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
};

exports.moveFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;

        const url = withKey(`${API_BASE}/files/${id}`) + `&parentId=${parentId || ''}`;
        const response = await axios.patch(url, {}, { headers: { 'Content-Type': 'application/json' } });

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Delete:', id);

        const response = await axios.delete(withKey(`${API_BASE}/files/${id}`));

        console.log('✅ Deleted!');
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Delete error:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
};

// ==================== FOLDERS ====================
exports.createFolder = async (req, res) => {
    try {
        const { name, parentId } = req.body;
        console.log('📁 Create:', name);

        const response = await axios.post(
            withKey(`${API_BASE}/folders`),
            { name, parentId },
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Created!');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Create error:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
};

exports.getFolders = async (req, res) => {
    try {
        const { q = '', folderId = '', maxResults = 100, pageToken = '' } = req.query;

        let url = `${API_BASE}/folders/list?key=${API_KEY}&maxResults=${maxResults}`;
        if (q) url += `&q=${encodeURIComponent(q)}`;
        if (folderId) url += `&folderId=${folderId}`;
        if (pageToken) url += `&pageToken=${pageToken}`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.getFolderInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(withKey(`${API_BASE}/folders/${id}`));
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
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
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.moveFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;

        const url = withKey(`${API_BASE}/folders/${id}`) + `&parentId=${parentId || ''}`;
        const response = await axios.patch(url, {}, { headers: { 'Content-Type': 'application/json' } });

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.delete(withKey(`${API_BASE}/folders/${id}`));
        res.json({ success: true });
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

// ==================== REMOTE UPLOAD ====================
exports.remoteUploadGD = async (req, res) => {
    try {
        const { fileId, folderName, parentId } = req.body;
        console.log('📥 Remote:', fileId);

        let url = `${API_BASE}/remote/${fileId}?key=${API_KEY}`;
        if (folderName) {
            url = `${API_BASE}/remote/${fileId}/folder?key=${API_KEY}&name=${encodeURIComponent(folderName)}`;
            if (parentId) url += `&parentId=${parentId}`;
        }

        const response = await axios.post(url, {}, { headers: { 'Content-Type': 'application/json' } });

        console.log('✅ Remote started!');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Remote error:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
};

// ==================== SUBTITLES ====================
exports.getSubtitles = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(withKey(`${API_BASE}/subtitles/${id}/list`));
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

exports.deleteSubtitle = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.delete(withKey(`${API_BASE}/subtitles/${id}`));
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
        const response = await axios.get(withKey(`${API_BASE}/about`));
        res.json({
            success: true,
            message: '✅ API Working!',
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
