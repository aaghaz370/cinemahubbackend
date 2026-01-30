const axios = require('axios');
const cheerio = require('cheerio');
// Puppeteer handling will be dynamically imported to avoid startup issues if not installed
let puppeteer, StealthPlugin;
try {
    puppeteer = require('puppeteer-extra');
    StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
} catch (e) {
    console.warn('⚠️ Puppeteer/Stealth not installed. Advanced extraction will be disabled.');
}

/**
 * Advanced Stream Extractor
 * Hybrid: Axios (Fast) + Puppeteer (Bypasses Cloudflare/403)
 */
class StreamExtractor {
    constructor() {
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        ];
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    createAxiosInstance(referer = null) {
        const headers = {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
        };
        if (referer) headers['Referer'] = referer;

        return axios.create({
            headers,
            timeout: 10000,
            validateStatus: status => status < 500,
            maxRedirects: 5
        });
    }

    /**
     * Main function: Tries Axios first, then falls back to Puppeteer
     */
    async extractStream(url) {
        try {
            console.log('🔍 [Axios] Trying fast extraction:', url);

            // Method 1: Fast Axios Attempt
            try {
                const instance = this.createAxiosInstance();
                const response = await instance.get(url);

                if (response.status === 200) {
                    // Additional check: valid HTML?
                    if (response.data && typeof response.data === 'string' && response.data.length > 500) {
                        const result = await this.parseHtml(response.data, response.request?.res?.responseUrl || url);
                        if (result) return result;
                    }
                }
                console.log(`⚠️ [Axios] Failed/Blocked (${response.status}). Switching to Puppeteer...`);
            } catch (err) {
                console.log(`⚠️ [Axios] Error: ${err.message}. Switching to Puppeteer...`);
            }

            // Method 2: Puppeteer Stealth Mode
            if (puppeteer) {
                return await this.extractWithPuppeteer(url);
            } else {
                throw new Error('Puppeteer not configured and Axios failed.');
            }

        } catch (error) {
            console.error('❌ All extraction methods failed:', error.message);
            throw error;
        }
    }

    /**
     * PUPPETEER ENGINE (The Heavy Lifter)
     */
    async extractWithPuppeteer(url) {
        console.log('🛡️ [Puppeteer] Launching stealth browser...');
        let browser = null;
        try {
            browser = await puppeteer.launch({
                headless: "new", // "new" is faster
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ]
            });

            const page = await browser.newPage();

            // Enable request interception to catch hidden streams
            await page.setRequestInterception(true);

            let foundStream = null;

            page.on('request', request => {
                const reqUrl = request.url();
                // Check for media files in network traffic
                if (reqUrl.includes('.m3u8') || reqUrl.includes('.mp4')) {
                    // Filter out segments, keep master playlists
                    if (!reqUrl.includes('.ts') && !foundStream) {
                        console.log('🎯 [Puppeteer] Detected stream in network:', reqUrl);
                        foundStream = {
                            url: reqUrl,
                            type: reqUrl.includes('.m3u8') ? 'hls' : 'mp4',
                            source: 'network_intercept'
                        };
                    }
                }
                request.continue();
            });

            console.log('⏳ [Puppeteer] Navigating to:', url);
            await page.setUserAgent(this.getRandomUserAgent());

            // Go to page and wait for network idle (meaning redirection/loading finished)
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // If network intercept caught something, return it
            if (foundStream) {
                await browser.close();
                return foundStream;
            }

            // If not, scan the final DOM contents (in case it was generated by JS)
            const content = await page.content();
            const finalUrl = page.url();
            console.log('📄 [Puppeteer] Page loaded. Scanning DOM...');

            const result = await this.parseHtml(content, finalUrl);

            await browser.close();

            if (result) return result;

            // Recursive Iframe Check (Advanced)
            const $ = cheerio.load(content);
            const iframeSrc = $('iframe').first().attr('src');
            if (iframeSrc) {
                console.log('🔄 [Puppeteer] Found inner iframe, following:', iframeSrc);
                return await this.extractStream(iframeSrc); // Recursive call
            }

        } catch (err) {
            if (browser) await browser.close();
            throw new Error(`Puppeteer failed: ${err.message}`);
        }

        throw new Error('No stream found by Puppeteer');
    }

    /**
     * Universal HTML Parser (Used by both Axios and Puppeteer)
     */
    async parseHtml(html, finalUrl) {
        // 1. Regex Scan
        const m3u8Match = html.match(/(https?:\/\/[^"']+\.m3u8[^"']*)/i);
        if (m3u8Match) return { type: 'hls', url: this.cleanUrl(m3u8Match[1]), source: 'regex' };

        const mp4Match = html.match(/(https?:\/\/[^"']+\.mp4[^"']*)/i);
        if (mp4Match) return { type: 'mp4', url: this.cleanUrl(mp4Match[1]), source: 'regex' };

        // 2. Player Config Scan (JWPlayer / Plyr)
        const fileMatch = html.match(/file["']?\s*:\s*["']([^"']+)["']/i);
        if (fileMatch) {
            const url = this.cleanUrl(fileMatch[1]);
            if (url.includes('.m3u8') || url.includes('.mp4')) {
                return { type: url.includes('.m3u8') ? 'hls' : 'mp4', url, source: 'player_config' };
            }
        }

        // 3. Script Source Scan (Common in streaming sites)
        const sourcesMatch = html.match(/sources\s*:\s*\[\s*{\s*file\s*:\s*["']([^"']+)["']/i);
        if (sourcesMatch) {
            return { type: 'hls', url: this.cleanUrl(sourcesMatch[1]), source: 'script_source' };
        }

        return null;
    }

    cleanUrl(url) {
        return url.replace(/\\/g, '').trim();
    }
}

module.exports = new StreamExtractor();
