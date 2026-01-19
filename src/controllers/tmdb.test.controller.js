/**
 * Test TMDB API Connection
 * Debug endpoint to verify TMDB API key and connectivity
 */

const tmdb = require('../config/tmdb');
const { fetchMovieExtras } = require('../helpers/tmdb.helper');

// Test TMDB connectivity with a known movie
exports.testTmdbConnection = async (req, res) => {
    try {
        // Test with a popular movie (The Shawshank Redemption - ID: 278)
        const testMovieId = 278;

        console.log('🧪 Testing TMDB API...');
        console.log('API Key present:', !!process.env.TMDB_API_KEY);
        console.log('API Key (first 10 chars):', process.env.TMDB_API_KEY?.substring(0, 10) || 'MISSING');

        // Test 1: Basic movie details
        const movieResponse = await tmdb.get(`/movie/${testMovieId}`);
        console.log('✅ Basic API call successful');

        // Test 2: Watch providers
        const providersResponse = await tmdb.get(`/movie/${testMovieId}/watch/providers`);
        console.log('✅ Watch providers API call successful');

        // Test 3: Use helper function
        const extras = await fetchMovieExtras(testMovieId);
        console.log('✅ Helper function successful');

        res.json({
            success: true,
            message: 'TMDB API is working correctly',
            tests: {
                apiKeyPresent: !!process.env.TMDB_API_KEY,
                basicCall: !!movieResponse.data,
                providersCall: !!providersResponse.data,
                helperFunction: !!extras,
                sampleMovie: {
                    title: movieResponse.data.title,
                    tmdbId: movieResponse.data.id,
                    providers: extras.watchProviders,
                    videosCount: extras.videos?.length || 0
                }
            }
        });

    } catch (error) {
        console.error('❌ TMDB Test Failed:', error.message);
        console.error('Error details:', error.response?.data || error);

        res.status(500).json({
            success: false,
            error: 'TMDB API test failed',
            message: error.message,
            details: error.response?.data || null,
            apiKeyPresent: !!process.env.TMDB_API_KEY
        });
    }
};
