/**
 * Deployment Verification Endpoint
 * Returns current deployment info and git commit
 */

exports.getDeploymentInfo = async (req, res) => {
    const fs = require('fs');
    const path = require('path');

    try {
        // Read package.json for version
        const packagePath = path.join(__dirname, '../../package.json');
        let version = 'unknown';
        try {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            version = packageJson.version || 'unknown';
        } catch (e) {
            // Ignore
        }

        res.json({
            success: true,
            deployment: {
                timestamp: new Date().toISOString(),
                nodeVersion: process.version,
                environment: process.env.NODE_ENV || 'development',
                version: version,
                uptime: `${Math.floor(process.uptime() / 60)} minutes`,
                codeChecksum: 'migration-v2-updateone-fix', // Identifier for this version
                features: {
                    useUpdateOne: true,  // New feature flag
                    bypassValidation: true,
                    directMongoUpdate: true
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
