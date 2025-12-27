const axios = require('axios');

const API_KEY = 'bae3b7ed62104a5c863a3c152c3ce8ba';
const API_BASE = 'https://api.abyss.to/v1';
const UPLOAD_URL = 'https://up.abyss.to';

// ==================== RESOURCES ====================

exports.getResources = async (req, res) => {
    try {
        const { q = '', folderId = '', maxResults = 100, pageToken = '' } = req.query;

        const response = await axios.get(`${API_BASE}/resources?key=${API_KEY}`, {
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
        const response = await axios.get(`${API_BASE}/about?key=${API_KEY}`);
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
        const response = await axios.get(`${API_BASE}/files/${id}?key=${API_KEY}`);
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

        console.log('Rename file request - ID:', id, 'New name:', name);

        const response = await axios.put(
            `${API_BASE}/files/${id}?key=${API_KEY}`,
            { name },
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('Abyss rename response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('❌ Abyss rename error:');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Message:', error.message);
        res.status(500).json({
            error: error.response?.data || error.message,
            status: error.response?.status
        });
    }
};

exports.moveFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;

        const response = await axios.patch(
            `${API_BASE}/files/${id}?key=${API_KEY}&parentId=${parentId || ''}`,
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
        console.log('Delete file request - ID:', id);

        const response = await axios.delete(`${API_BASE}/files/${id}?key=${API_KEY}`);

        console.log('✅ File deleted successfully');
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Delete file error:');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        res.status(500).json({
            error: error.response?.data || error.message,
            status: error.response?.status
        });
    }
};

// ==================== FOLDERS ====================

exports.createFolder = async (req, res) => {
    try {
        const { name, parentId } = req.body;

        console.log('Create folder request - Name:', name, 'ParentID:', parentId);

        const response = await axios.post(
            `${API_BASE}/folders?key=${API_KEY}`,
            { name, parentId },
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Folder created:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('❌ Create folder error:');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        res.status(500).json({
            error: error.response?.data || error.message,
            status: error.response?.status
        });
    }
};

exports.getFolders = async (req, res) => {
    try {
        const { q = '', folderId = '', maxResults = 100, pageToken = '' } = req.query;

        const response = await axios.get(`${API_BASE}/folders/list?key=${API_KEY}`, {
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
        const response = await axios.get(`${API_BASE}/folders/${id}?key=${API_KEY}`);
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
            `${API_BASE}/folders/${id}?key=${API_KEY}`,
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
            `${API_BASE}/folders/${id}?key=${API_KEY}&parentId=${parentId || ''}`,
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
        const response = await axios.delete(`${API_BASE}/folders/${id}?key=${API_KEY}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// ==================== REMOTE UPLOAD ====================

exports.remoteUploadGD = async (req, res) => {
    try {
        const { fileId, folderName, parentId } = req.body;

        console.log('Remote GD upload:', fileId);

        let url = `${API_BASE}/remote/${fileId}`;
        if (folderName) {
            url = `${API_BASE}/remote/${fileId}/folder?name=${encodeURIComponent(folderName)}`;
            if (parentId) url += `&parentId=${parentId}`;
        }

        const response = await axios.post(
            `${url}?key=${API_KEY}`,
            {},
            { headers: { 'Content-Type': 'application/json' } }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Abyss remote upload error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.msg || error.message,
            details: error.response?.data
        });
    }
};

exports.remoteUploadUrl = async (req, res) => {
    try {
        const { url } = req.body;

        console.log('Remote URL upload request:', url);

        // Try Abyss internal API
        try {
            const response = await axios.post(
                'https://abyss.to/api/v1/queue/add',
                { urls: [url], apiKey: API_KEY },
                { headers: { 'Content-Type': 'application/json' } }
            );

            res.json({ success: true, message: 'URL added to upload queue', data: response.data });
        } catch (apiError) {
            // Fallback message
            res.json({
                success: false,
                message: 'Direct URL upload requires manual action',
                instruction: 'Go to https://abyss.to/dashboard/d/upload and paste URL in "Remote Url" tab',
                url: url
            });
        }
    } catch (error) {
        console.error('Remote URL error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// ==================== SUBTITLES ====================

exports.getSubtitles = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${API_BASE}/subtitles/${id}/list?key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSubtitle = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.delete(`${API_BASE}/subtitles/${id}?key=${API_KEY}`);
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
