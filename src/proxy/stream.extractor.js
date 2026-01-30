const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extract direct video stream URL from embed pages
 * Works with various embed sources (Abyss, VidCloud, etc.)
 */

class StreamExtractor {
    constructor() {
        this.axios = axios.create({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://google.com'
            },
            maxRedirects: 5,
            timeout: 10000
        });
    }

    /**
     * Main extraction function
     */
    async extractStream(url) {
        try {
            console.log('🔍 Extracting stream from:', url);

            // Step 1: Follow redirects and get final page
            const response = await this.axios.get(url);
            const html = response.data;
            const finalUrl = response.request.res.responseUrl || url;

            console.log('📄 Final URL:', finalUrl);

            // Step 2: Try multiple extraction methods
            let streamUrl = null;

            // Method 1: Look for .m3u8 in HTML
            streamUrl = this.extractM3U8FromHTML(html);
            if (streamUrl) {
                console.log('✅ Found M3U8 in HTML');
                return { type: 'hls', url: streamUrl, source: 'html' };
            }

            // Method 2: Look for .mp4 in HTML
            streamUrl = this.extractMP4FromHTML(html);
            if (streamUrl) {
                console.log('✅ Found MP4 in HTML');
                return { type: 'mp4', url: streamUrl, source: 'html' };
            }

            // Method 3: Parse JavaScript for video sources
            streamUrl = this.extractFromJavaScript(html);
            if (streamUrl) {
                console.log('✅ Found stream in JavaScript');
                return streamUrl;
            }

            // Method 4: Look for common player configs
            streamUrl = this.extractFromPlayerConfig(html);
            if (streamUrl) {
                console.log('✅ Found stream in player config');
                return streamUrl;
            }

            // Method 5: Check for iframe sources (recursive)
            const iframeUrl = this.extractIframeSource(html);
            if (iframeUrl && iframeUrl !== url) {
                console.log('🔄 Found iframe, extracting recursively...');
                return await this.extractStream(iframeUrl);
            }

            throw new Error('Could not extract video stream from this URL');

        } catch (error) {
            console.error('❌ Extraction error:', error.message);
            throw error;
        }
    }

    /**
     * Extract M3U8 (HLS) URLs from HTML
     */
    extractM3U8FromHTML(html) {
        const m3u8Patterns = [
            /https?:\/\/[^\s"']+\.m3u8[^\s"']*/gi,
            /"file"\s*:\s*"([^"]+\.m3u8[^"]*)"/i,
            /'file'\s*:\s*'([^']+\.m3u8[^']*)'/i,
            /source\s*:\s*"([^"]+\.m3u8[^"]*)"/i,
            /src\s*:\s*"([^"]+\.m3u8[^"]*)"/i
        ];

        for (const pattern of m3u8Patterns) {
            const match = html.match(pattern);
            if (match) {
                const url = match[1] || match[0];
                if (url.includes('.m3u8')) {
                    return this.cleanUrl(url);
                }
            }
        }
        return null;
    }

    /**
     * Extract MP4 URLs from HTML
     */
    extractMP4FromHTML(html) {
        const mp4Patterns = [
            /https?:\/\/[^\s"']+\.mp4[^\s"']*/gi,
            /"file"\s*:\s*"([^"]+\.mp4[^"]*)"/i,
            /'file'\s*:\s*'([^']+\.mp4[^']*)'/i,
            /source\s*:\s*"([^"]+\.mp4[^"]*)"/i,
            /src\s*:\s*"([^"]+\.mp4[^"]*)"/i,
            /"url"\s*:\s*"([^"]+\.mp4[^"]*)"/i
        ];

        for (const pattern of mp4Patterns) {
            const match = html.match(pattern);
            if (match) {
                const url = match[1] || match[0];
                if (url.includes('.mp4')) {
                    return this.cleanUrl(url);
                }
            }
        }
        return null;
    }

    /**
     * Extract from JavaScript variables/configs
     */
    extractFromJavaScript(html) {
        // JWPlayer config
        const jwPlayerMatch = html.match(/jwplayer\([^)]+\)\.setup\(({[^}]+})\)/i);
        if (jwPlayerMatch) {
            try {
                const config = jwPlayerMatch[1];
                const fileMatch = config.match(/"file"\s*:\s*"([^"]+)"/i);
                if (fileMatch) {
                    return {
                        type: fileMatch[1].includes('.m3u8') ? 'hls' : 'mp4',
                        url: this.cleanUrl(fileMatch[1]),
                        source: 'jwplayer'
                    };
                }
            } catch (e) { }
        }

        // Video.js / Plyr configs
        const videoJsMatch = html.match(/sources\s*:\s*\[\s*{\s*src\s*:\s*["']([^"']+)["']/i);
        if (videoJsMatch) {
            return {
                type: videoJsMatch[1].includes('.m3u8') ? 'hls' : 'mp4',
                url: this.cleanUrl(videoJsMatch[1]),
                source: 'videojs'
            };
        }

        return null;
    }

    /**
     * Extract from common player config patterns
     */
    extractFromPlayerConfig(html) {
        const configPatterns = [
            /playerConfig\s*=\s*({.+?});/s,
            /var\s+config\s*=\s*({.+?});/s,
            /const\s+config\s*=\s*({.+?});/s
        ];

        for (const pattern of configPatterns) {
            const match = html.match(pattern);
            if (match) {
                try {
                    const urlMatch = match[1].match(/"(?:file|url|src)"\s*:\s*"([^"]+)"/i);
                    if (urlMatch) {
                        const url = this.cleanUrl(urlMatch[1]);
                        return {
                            type: url.includes('.m3u8') ? 'hls' : 'mp4',
                            url: url,
                            source: 'config'
                        };
                    }
                } catch (e) { }
            }
        }
        return null;
    }

    /**
     * Extract iframe source for recursive extraction
     */
    extractIframeSource(html) {
        const $ = cheerio.load(html);
        const iframe = $('iframe').first();
        if (iframe.length) {
            let src = iframe.attr('src') || iframe.attr('data-src');
            if (src) {
                // Handle relative URLs
                if (src.startsWith('//')) {
                    src = 'https:' + src;
                } else if (src.startsWith('/')) {
                    // Would need base URL - skip for now
                    return null;
                }
                return src;
            }
        }
        return null;
    }

    /**
     * Clean and validate URL
     */
    cleanUrl(url) {
        // Remove escape characters
        url = url.replace(/\\"/g, '"').replace(/\\\//g, '/');

        // Decode HTML entities
        url = url.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

        // Trim whitespace
        url = url.trim();

        return url;
    }

    /**
     * Test if URL is valid stream
     */
    async testStream(url, type) {
        try {
            const response = await this.axios.head(url, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new StreamExtractor();
