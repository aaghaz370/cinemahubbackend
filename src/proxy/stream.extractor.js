const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extract direct video stream URL from embed pages
 * Works with various embed sources (Abyss, VidCloud, etc.)
 */

class StreamExtractor {
    constructor() {
        // Rotate between multiple User-Agents to avoid detection
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        ];
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    createAxiosInstance(referer = null) {
        const headers = {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'max-age=0',
            'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="131", "Chromium";v="131"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'DNT': '1',
            'Connection': 'keep-alive'
        };

        if (referer) {
            headers['Referer'] = referer;
            headers['Sec-Fetch-Site'] = 'same-origin';
        }

        return axios.create({
            headers,
            maxRedirects: 10,
            timeout: 15000,
            validateStatus: (status) => status < 500,
            withCredentials: false
        });
    }

    /**
     * Main extraction function
     */
    async extractStream(url) {
        try {
            console.log('🔍 Extracting stream from:', url);

            // Create axios instance with no referer for initial request
            const axiosInstance = this.createAxiosInstance();

            // Step 1: Follow redirects and get final page
            const response = await axiosInstance.get(url);

            // Check if blocked
            if (response.status === 403 || response.status === 401) {
                console.log('⚠️ Initial request blocked, trying with referer...');
                // Retry with referer
                const retryInstance = this.createAxiosInstance('https://www.google.com/');
                const retryResponse = await retryInstance.get(url);

                if (retryResponse.status >= 400) {
                    throw new Error(`Access denied (${retryResponse.status}). Website may have bot protection.`);
                }

                return await this.processResponse(retryResponse, url);
            }

            if (response.status >= 400) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await this.processResponse(response, url);

        } catch (error) {
            console.error('❌ Extraction error:', error.message);
            throw error;
        }
    }

    /**
     * Process response and extract stream
     */
    async processResponse(response, originalUrl) {
        const html = response.data;
        const finalUrl = response.request?.res?.responseUrl || response.config?.url || originalUrl;

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
        if (iframeUrl && iframeUrl !== originalUrl) {
            console.log('🔄 Found iframe, extracting recursively...');
            return await this.extractStream(iframeUrl);
        }

        throw new Error('Could not extract video stream from this URL');
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
        url = url.replace(/\\"/g, '"').replace(/\\\//g, '/');
        url = url.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
        url = url.trim();
        return url;
    }

    /**
     * Test if URL is valid stream
     */
    async testStream(url, type) {
        try {
            const instance = this.createAxiosInstance();
            const response = await instance.head(url, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new StreamExtractor();
