const TelegramBot = require('node-telegram-bot-api');

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_TELEGRAM_IDS = process.env.ADMIN_TELEGRAM_IDS;

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const { name, matricule, grade } = body;

        if (!ADMIN_TELEGRAM_IDS) {
            console.warn('No ADMIN_TELEGRAM_IDS configured');
            return { statusCode: 200, body: 'No admins configured' };
        }

        const adminIds = ADMIN_TELEGRAM_IDS.split(',').map(id => id.trim());
        const message = `🔔 *تسجيل عضو جديد*\n\n👤 *الاسم:* ${name}\n🔢 *رقم العضوية:* ${matricule}\n🏅 *الدرجة:* ${grade}\n\nيرجى مراجعة طلب الانضمام في لوحة التحكم.`;

        const promises = adminIds.map(chatId =>
            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
                .catch(err => console.error(`Failed to send to ${chatId}:`, err))
        );

        await Promise.all(promises);

        return { statusCode: 200, body: 'Notification sent' };

    } catch (error) {
        console.error('Error sending notification:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
