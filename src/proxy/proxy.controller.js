const streamExtractor = require('./stream.extractor');

/**
 * Proxy Controller
 * Handles video stream extraction and proxying
 */

class ProxyController {
    /**
     * Extract direct stream URL from embed page
     * GET /api/proxy/extract?url=<embed_url>
     */
    async extractStream(req, res) {
        try {
            const { url } = req.query;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'URL parameter is required'
                });
            }

            // Decode URL if encoded
            const decodedUrl = decodeURIComponent(url);

            console.log('🎬 Extracting stream from:', decodedUrl);

            // Extract stream URL
            const result = await streamExtractor.extractStream(decodedUrl);

            if (!result || !result.url) {
                return res.status(404).json({
                    success: false,
                    message: 'Could not extract video stream from this URL'
                });
            }

            // Return extracted stream info
            res.json({
                success: true,
                data: {
                    streamUrl: result.url,
                    type: result.type, // 'hls' or 'mp4'
                    source: result.source,
                    originalUrl: decodedUrl
                }
            });

        } catch (error) {
            console.error('❌ Extract stream error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to extract stream',
                error: error.message
            });
        }
    }

    /**
     * Test endpoint to verify extractor is working
     * GET /api/proxy/test
     */
    async test(req, res) {
        res.json({
            success: true,
            message: 'Proxy service is running',
            endpoints: {
                extract: '/api/proxy/extract?url=<embed_url>',
                test: '/api/proxy/test'
            }
        });
    }
}

module.exports = new ProxyController();
