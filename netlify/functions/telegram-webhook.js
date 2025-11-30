const TelegramBot = require('node-telegram-bot-api');
const { Client, Databases, Users, ID, Query } = require('node-appwrite');
const crypto = require('crypto');

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const WEB_APP_URL = process.env.WEB_APP_URL;

// Initialize Telegram Bot (No polling!)
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// Initialize Appwrite
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);

const generateToken = () => crypto.randomBytes(32).toString('hex');

const handleAccessRequest = async (chatId, telegramId, fullName, firstName) => {
    try {
        // 1. Check if member exists
        const memberResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            'members',
            [Query.equal('telegram_id', telegramId.toString())]
        );

        let accessUrl;
        let buttonText;
        let isLogin = false;

        if (memberResponse.documents.length > 0) {
            // Potential LOGIN FLOW
            const member = memberResponse.documents[0];
            const userId = member.user_id;

            try {
                // Generate Appwrite Token for session
                const token = await users.createToken(userId);

                // Use HashRouter URL
                accessUrl = `${WEB_APP_URL}/#/telegram-login?userId=${userId}&secret=${token.secret}`;
                buttonText = '🚀 الدخول إلى حسابي';
                console.log(`Generated Login URL for ${fullName}`);
                isLogin = true;
            } catch (err) {
                if (err.code === 404) {
                    console.log(`⚠️ Orphan member found for ${fullName} (User ID: ${userId}). Deleting member document...`);
                    await databases.deleteDocument(APPWRITE_DATABASE_ID, 'members', member.$id);
                    // Fall through to signup flow
                } else {
                    throw err;
                }
            }
        }

        if (!isLogin) {
            // SIGNUP FLOW
            const token = generateToken();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

            await databases.createDocument(
                APPWRITE_DATABASE_ID,
                'magic_links',
                ID.unique(),
                {
                    token,
                    type: 'access',
                    telegram_id: telegramId.toString(),
                    telegram_name: fullName,
                    expires_at: expiresAt,
                    used: false
                }
            );

            // Use HashRouter URL
            accessUrl = `${WEB_APP_URL}/#/telegram-signup?token=${token}`;
            buttonText = '📝 إنشاء حساب جديد';
            console.log(`Generated Signup URL for ${fullName}`);
        }

        // Send message with Web App button (opens directly in Telegram without browser confirmation)
        const messageText = isLogin
            ? `مرحباً ${firstName}! 👋\n\n✅ تم العثور على حسابك\n\nاضغط على الزر أدناه للدخول إلى حسابك بشكل آمن.`
            : `مرحباً ${firstName}! 👋\n\n📝 مرحباً بك في جمعية الجوار\n\nاضغط على الزر أدناه لإنشاء حسابك وإكمال التسجيل.`;

        await bot.sendMessage(chatId, messageText, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: buttonText, web_app: { url: accessUrl } }],
                    [{ text: '🔄 تحديث الرابط', callback_data: 'refresh_link' }]
                ]
            }
        });

    } catch (error) {
        console.error('Error handling access request:', error);
        await bot.sendMessage(chatId, '❌ حدث خطأ. يرجى المحاولة لاحقا.');
    }
};

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        console.log('Received update:', JSON.stringify(body));

        // Handle Message
        if (body.message) {
            const msg = body.message;
            const chatId = msg.chat.id;
            const text = msg.text;

            if (text === '/start' || text === '🚀 الدخول إلى الموقع') {
                const telegramId = msg.from.id;
                const firstName = msg.from.first_name || '';
                const lastName = msg.from.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim();

                await handleAccessRequest(chatId, telegramId, fullName, firstName);
            }
        }
        // Handle Callback Query
        else if (body.callback_query) {
            const callbackQuery = body.callback_query;
            const message = callbackQuery.message;
            const chatId = message.chat.id;
            const data = callbackQuery.data;
            const telegramId = callbackQuery.from.id;
            const firstName = callbackQuery.from.first_name || '';
            const lastName = callbackQuery.from.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();

            if (data === 'refresh_link') {
                // Answer callback to stop loading animation
                await bot.answerCallbackQuery(callbackQuery.id, { text: 'جاري تحديث الرابط...' });

                // Delete the old message to keep chat clean
                try {
                    await bot.deleteMessage(chatId, message.message_id);
                } catch (e) {
                    console.error('Could not delete message:', e);
                }

                // Generate new link
                await handleAccessRequest(chatId, telegramId, fullName, firstName);
            }
        }

        return { statusCode: 200, body: 'OK' };

    } catch (error) {
        console.error('Error processing update:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
