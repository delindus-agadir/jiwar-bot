const TelegramBot = require('node-telegram-bot-api');

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const { telegramId, status, name } = body;

        if (!telegramId) {
            return { statusCode: 400, body: 'Missing telegramId' };
        }

        let message = '';
        if (status === 'approved') {
            message = `🎉 *تهانينا ${name}!* \n\n✅ تمت الموافقة على عضويتك. يمكنك الآن الدخول إلى حسابك.`;
        } else if (status === 'rejected') {
            message = `❌ *مرحباً ${name}* \n\nنأسف لإبلاغك بأنه لم يتم قبول طلب عضويتك في الوقت الحالي.\nيرجى التواصل مع الإدارة للمزيد من التفاصيل.`;
        } else if (status === 'dependent_approved') {
            const { dependentName } = body;
            message = `🎉 *تحديث طلب إضافة تابع* \n\n✅ تمت الموافقة على إضافة *${dependentName}* إلى حسابك.`;
        } else if (status === 'dependent_rejected') {
            const { dependentName } = body;
            message = `❌ *تحديث طلب إضافة تابع* \n\nنأسف لإبلاغك بأنه لم يتم قبول طلب إضافة *${dependentName}*.\nيرجى التواصل مع الإدارة للمزيد من التفاصيل.`;
        } else {
            return { statusCode: 400, body: 'Invalid status' };
        }

        await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });

        return { statusCode: 200, body: 'Notification sent' };

    } catch (error) {
        console.error('Error sending member notification:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
