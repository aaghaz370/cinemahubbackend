/**
 * Email Service for CinemaHub
 * Uses Nodemailer with Gmail (FREE)
 * 
 * Setup:
 * 1. Enable 2FA on your Gmail account
 * 2. Create App Password: https://myaccount.google.com/apppasswords
 * 3. Add to .env: 
 *    EMAIL_USER=your-email@gmail.com
 *    EMAIL_PASS=your-app-password
 */

const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Check if email is configured
const isEmailConfigured = () => {
    return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

// Send password reset email
const sendPasswordResetEmail = async (toEmail, resetToken, userName) => {
    if (!isEmailConfigured()) {
        console.log('⚠️ Email not configured. Skipping email send.');
        return { success: false, error: 'Email not configured' };
    }

    try {
        const transporter = createTransporter();

        // Reset link (admin panel)
        const resetLink = `${process.env.ADMIN_URL || 'https://cinemahub-admin.vercel.app'}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: {
                name: 'CinemaHub Admin',
                address: process.env.EMAIL_USER
            },
            to: toEmail,
            subject: '🔐 Password Reset Request - CinemaHub Admin',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background: #1a1a1a; margin: 0; padding: 20px; }
                        .container { max-width: 500px; margin: 0 auto; background: #2a2a2a; border-radius: 16px; padding: 40px; }
                        .logo { text-align: center; margin-bottom: 30px; }
                        .logo span { font-size: 28px; font-weight: bold; }
                        .logo .red { color: #dc2626; }
                        .logo .white { color: white; }
                        h1 { color: white; text-align: center; margin-bottom: 20px; }
                        p { color: #9ca3af; line-height: 1.6; }
                        .button { display: block; text-align: center; margin: 30px 0; }
                        .button a { background: linear-gradient(to right, #dc2626, #991b1b); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; }
                        .warning { background: #fef3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-top: 20px; }
                        .warning p { color: #856404; margin: 0; font-size: 14px; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #444; }
                        .footer p { color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            <span class="red">CINEMA</span><span class="white">HUB</span>
                        </div>
                        
                        <h1>Password Reset</h1>
                        
                        <p>Hello <strong style="color: white;">${userName || 'Admin'}</strong>,</p>
                        
                        <p>We received a request to reset your password for CinemaHub Admin Panel. Click the button below to reset your password:</p>
                        
                        <div class="button">
                            <a href="${resetLink}">Reset Password</a>
                        </div>
                        
                        <p>This link will expire in <strong style="color: white;">1 hour</strong>.</p>
                        
                        <div class="warning">
                            <p>⚠️ If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from CinemaHub Admin</p>
                            <p>© ${new Date().getFullYear()} CinemaHub. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent to:', toEmail);
        return { success: true };

    } catch (error) {
        console.error('❌ Email error:', error.message);
        return { success: false, error: error.message };
    }
};

// Send notification email (for new releases, etc.)
const sendNotificationEmail = async (toEmail, subject, message) => {
    if (!isEmailConfigured()) {
        return { success: false, error: 'Email not configured' };
    }

    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: {
                name: 'CinemaHub',
                address: process.env.EMAIL_USER
            },
            to: toEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #1a1a1a; color: white; border-radius: 16px;">
                    <h2 style="color: #dc2626;">CinemaHub</h2>
                    <p>${message}</p>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        © ${new Date().getFullYear()} CinemaHub
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true };

    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    isEmailConfigured,
    sendPasswordResetEmail,
    sendNotificationEmail
};
