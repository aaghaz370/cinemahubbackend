const axios = require('axios');
const FormData = require('form-data');

const API_KEY = 'bae3b7ed62104a5c863a3c152c3ce8ba';
const API_BASE = 'https://api.abyss.to/v1';
const UPLOAD_URL = 'https://up.abyss.to';

// ==================== RESOURCES ====================

// Get all videos/folders
exports.getResources = async (req, res) => {
    try {
        const { q = '', folderId = '', maxResults = 100, pageToken = '' } = req.query;

        const response = await axios.get(`${API_BASE}/resources`, {
            params: {
                key: API_KEY,
                q,
                folderId,
                maxResults,
                pageToken,
                orderBy: 'createdAt:desc'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get storage quota
exports.getQuota = async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE}/about`, {
            params: { key: API_KEY }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// ==================== FILES ====================

// Get file info
exports.getFileInfo = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.get(`${API_BASE}/files/${id}`, {
            params: { key: API_KEY }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Rename file
exports.renameFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const response = await axios.put(
            `${API_BASE}/files/${id}`,
            { name },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Move file to folder
exports.moveFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;

        const response = await axios.patch(
            `${API_BASE}/files/${id}?parentId=${parentId || ''}`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Delete file
exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.delete(`${API_BASE}/files/${id}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// ==================== FOLDERS ====================

// Create folder
exports.createFolder = async (req, res) => {
    try {
        const { name, parentId } = req.body;

        const response = await axios.post(
            `${API_BASE}/folders`,
            { name, parentId },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get folders list
exports.getFolders = async (req, res) => {
    try {
        const { q = '', folderId = '', maxResults = 100, pageToken = '' } = req.query;

        const response = await axios.get(`${API_BASE}/folders/list`, {
            params: {
                key: API_KEY,
                q,
                folderId,
                maxResults,
                pageToken
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get folder info
exports.getFolderInfo = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.get(`${API_BASE}/folders/${id}`, {
            params: { key: API_KEY }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Rename folder
exports.renameFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const response = await axios.put(
            `${API_BASE}/folders/${id}`,
            { name },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Move folder
exports.moveFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId } = req.body;

        const response = await axios.patch(
            `${API_BASE}/folders/${id}?parentId=${parentId || ''}`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Delete folder
exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.delete(`${API_BASE}/folders/${id}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// ==================== REMOTE UPLOAD ====================

// Remote upload - Google Drive
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
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
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

// Remote upload - Direct URL (using their web interface method)
exports.remoteUploadUrl = async (req, res) => {
    try {
        const { url } = req.body;

        console.log('Remote URL upload request:', url);

        // Abyss accepts direct URLs via their dashboard
        // This uses their internal API endpoint
        const response = await axios.post(
            'https://abyss.to/api/v1/queue/add',
            {
                urls: [url],
                apiKey: API_KEY
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ success: true, message: 'URL added to upload queue', data: response.data });
    } catch (error) {
        // Fallback: Return instruction for manual addition
        console.error('Direct URL upload error:', error.message);
        res.json({
            success: false,
            message: 'Please use Google Drive links for automatic remote upload',
            alternativeMethod: 'You can add direct URLs via Abyss dashboard: https://abyss.to/dashboard/d/upload',
            url: req.body.url
        });
    }
};

// ==================== SUBTITLES ====================

// Get subtitle list
exports.getSubtitles = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.get(`${API_BASE}/subtitles/${id}/list`, {
            params: { key: API_KEY }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Delete subtitle
exports.deleteSubtitle = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.delete(`${API_BASE}/subtitles/${id}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// ==================== UPLOAD ====================

// Get upload URL
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
