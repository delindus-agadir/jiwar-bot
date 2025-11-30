const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

exports.handler = async (event) => {
    // Only allow GET requests for easy browser access
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const bot = new TelegramBot(BOT_TOKEN, { polling: false });

        const commands = [
            { command: 'start', description: '🚀 الدخول إلى الموقع / Start' },
            { command: 'help', description: '❓ المساعدة / Help' }
        ];

        await bot.setMyCommands(commands);
        console.log('Bot commands set successfully');

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Commands set successfully!',
                commands: commands
            })
        };
    } catch (error) {
        console.error('Error setting commands:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to set commands', details: error.message })
        };
    }
};
