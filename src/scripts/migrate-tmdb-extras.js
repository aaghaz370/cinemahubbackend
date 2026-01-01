/**
 * Migration Script: Update Existing Movies & Series with Watch Providers & Videos
 * Run this ONCE to populate data for existing content
 * 
 * Usage: node src/scripts/migrate-tmdb-extras.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Series = require('../models/Series');
const { fetchMovieExtras, fetchSeriesExtras } = require('../helpers/tmdb.helper');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Sleep helper to avoid rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ================= MIGRATE MOVIES =================

async function migrateMovies() {
    console.log('🎬 Starting Movie Migration...\n');

    const movies = await Movie.find({});
    console.log(`Found ${movies.length} movies\n`);

    let updated = 0;
    let failed = 0;

    for (const movie of movies) {
        try {
            console.log(`Processing: ${movie.title} (TMDB: ${movie.tmdbId})`);

            // Fetch extras from TMDB
            const { watchProviders, videos } = await fetchMovieExtras(movie.tmdbId);

            // Update movie
            if (watchProviders || videos.length > 0) {
                if (watchProviders) {
                    movie.metadata.watchProviders = watchProviders;
                }
                if (videos.length > 0) {
                    movie.metadata.videos = videos;
                }

                await movie.save();
                updated++;
                console.log(`✅ Updated: ${movie.title}\n`);
            } else {
                console.log(`⚠️  No data found for: ${movie.title}\n`);
            }

            // Wait 300ms between requests to avoid rate limiting (TMDB allows ~40 req/sec)
            await sleep(300);

        } catch (error) {
            failed++;
            console.error(`❌ Failed: ${movie.title} - ${error.message}\n`);
        }
    }

    console.log(`\n🎬 Movie Migration Complete!`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
}

// ================= MIGRATE SERIES =================

async function migrateSeries() {
    console.log('\n📺 Starting Series Migration...\n');

    const series = await Series.find({});
    console.log(`Found ${series.length} series\n`);

    let updated = 0;
    let failed = 0;

    for (const show of series) {
        try {
            console.log(`Processing: ${show.title} (TMDB: ${show.tmdbId})`);

            // Fetch extras from TMDB
            const { watchProviders, videos } = await fetchSeriesExtras(show.tmdbId);

            // Update series
            if (watchProviders || videos.length > 0) {
                if (watchProviders) {
                    show.metadata.watchProviders = watchProviders;
                }
                if (videos.length > 0) {
                    show.metadata.videos = videos;
                }

                await show.save();
                updated++;
                console.log(`✅ Updated: ${show.title}\n`);
            } else {
                console.log(`⚠️  No data found for: ${show.title}\n`);
            }

            await sleep(300);

        } catch (error) {
            failed++;
            console.error(`❌ Failed: ${show.title} - ${error.message}\n`);
        }
    }

    console.log(`\n📺 Series Migration Complete!`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
}

// ================= RUN MIGRATION =================

async function runMigration() {
    try {
        console.log('🚀 TMDB Extras Migration Starting...\n');
        console.log('════════════════════════════════════\n');

        await migrateMovies();
        await migrateSeries();

        console.log('\n════════════════════════════════════');
        console.log('✅ Migration Complete!');
        console.log('You can now close this script.\n');

        process.exit(0);
    } catch (error) {
        console.error('💥 Migration Failed:', error);
        process.exit(1);
    }
}

// Run migration
runMigration();
