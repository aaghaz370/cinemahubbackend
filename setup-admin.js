const mongoose = require('mongoose');
const AdminUser = require('./src/models/admin.user.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'your-mongodb-uri';

const setupSuperAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if Super Admin exists
        const existing = await AdminUser.findOne({ role: 'superadmin' });

        if (existing) {
            console.log('⚠️ Super Admin already exists:');
            console.log('   Email:', existing.email);
            console.log('   Name:', existing.name);
            return;
        }

        // Create Super Admin
        const superAdmin = new AdminUser({
            email: 'admin@cinemahub.com',
            password: 'SuperAdmin@123',  // CHANGE THIS PASSWORD IMMEDIATELY!
            name: 'Super Administrator',
            role: 'superadmin'
        });

        await superAdmin.save();

        console.log('\n✅ Super Admin Created Successfully!');
        console.log('================================================');
        console.log('📧 Email:    admin@cinemahub.com');
        console.log('🔒 Password: SuperAdmin@123');
        console.log('================================================');
        console.log('⚠️ IMPORTANT: Change this password immediately after first login!');
        console.log('\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

setupSuperAdmin();
