const TelegramBot = require('node-telegram-bot-api');

// Initialize bot (polling disabled for production - webhook recommended)
let bot = null;

const initBot = () => {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.warn('⚠️ TELEGRAM_BOT_TOKEN not set - Request notifications disabled');
        return null;
    }

    try {
        bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
        console.log('✅ Telegram Bot initialized');
        return bot;
    } catch (error) {
        console.error('❌ Telegram Bot init error:', error.message);
        return null;
    }
};

// Send request notification to admin
const sendRequestNotification = async (requestData) => {
    if (!bot) {
        console.log('⚠️ Telegram bot not initialized - skipping notification');
        return null;
    }

    try {
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
        if (!adminChatId) {
            console.warn('⚠️ TELEGRAM_ADMIN_CHAT_ID not set');
            return null;
        }

        const message = `
🎬 *New Content Request*

📝 *Type:* ${requestData.contentType === 'movie' ? '🎥 Movie' : '📺 Series'}
🎯 *Title:* ${requestData.title}
${requestData.year ? `📅 *Year:* ${requestData.year}` : ''}
${requestData.language ? `🌐 *Language:* ${requestData.language}` : ''}
${requestData.genre ? `🎭 *Genre:* ${requestData.genre}` : ''}

${requestData.description ? `📄 *Description:*\n${requestData.description}\n` : ''}
${requestData.imdbLink ? `🔗 *IMDb:* ${requestData.imdbLink}\n` : ''}

👤 *Requested by:* ${requestData.userName || 'Anonymous'}
${requestData.userEmail ? `📧 *Email:* ${requestData.userEmail}` : ''}

⏰ *Time:* ${new Date().toLocaleString('en-IN')}
    `.trim();

        const sentMessage = await bot.sendMessage(adminChatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });

        return sentMessage.message_id;
    } catch (error) {
        console.error('❌ Telegram notification error:', error.message);
        return null;
    }
};

// Update request status message (when approved/declined)
const updateRequestStatus = async (telegramMessageId, status, adminNote) => {
    if (!bot || !telegramMessageId) return;

    try {
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
        const statusEmoji = status === 'approved' ? '✅' : '❌';
        const statusText = status === 'approved' ? 'APPROVED' : 'DECLINED';

        const updateText = `\n\n${statusEmoji} *Status:* ${statusText}${adminNote ? `\n💬 *Note:* ${adminNote}` : ''}`;

        await bot.editMessageText(updateText, {
            chat_id: adminChatId,
            message_id: telegramMessageId,
            parse_mode: 'Markdown'
        }).catch(() => {
            // If edit fails, send new message
            bot.sendMessage(adminChatId, `Request #${telegramMessageId} ${statusText}`, {
                parse_mode: 'Markdown'
            });
        });
    } catch (error) {
        console.error('❌ Telegram update error:', error.message);
    }
};

module.exports = {
    initBot,
    sendRequestNotification,
    updateRequestStatus
};
