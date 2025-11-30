const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { telegramId, activityTitle, participants, location, eventDate, eventTime } = JSON.parse(event.body);

        if (!telegramId || !participants) {
            return { statusCode: 400, body: 'Missing required fields' };
        }

        // Format Date
        const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('fr-FR') : 'غير محدد';
        const formattedTime = eventTime || 'غير محدد';

        let message = `${activityTitle}\n\n`;
        message += `المكان : ${location || 'غير محدد'}\n`;
        message += `التاريخ : ${formattedDate}، على الساعة ${formattedTime}.\n`;
        message += `ـــــــــــــــــــــــــــــــــــــــــــــــــ\n`;
        message += `المسجلون للحضور :\n`;

        participants.forEach((p, index) => {
            const name = p.name || 'Unknown';
            const matricule = p.matricule || '-';

            // Format: 1- Name : [Matricule]
            message += `${index + 1}- ${name} : [${matricule}]\n`;
        });

        await bot.sendMessage(telegramId, message);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'List sent successfully' })
        };
    } catch (error) {
        console.error('Error sending participants list:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send list' })
        };
    }
};
