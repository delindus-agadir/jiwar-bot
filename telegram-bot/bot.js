import TelegramBot from 'node-telegram-bot-api';
import { Client, Databases, Users, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const WEB_APP_URL = process.env.WEB_APP_URL;

// Initialize Telegram Bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);

// ... (webhook delete remains same)

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

        // Send message with URL button
        await bot.sendMessage(chatId,
            `مرحبا ${firstName}! 👋\n\n` +
            `اضغط على الزر أدناه للمتابعة:`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: buttonText, url: accessUrl }],
                        [{ text: '🔄 تحديث الرابط', callback_data: 'refresh_link' }]
                    ]
                }
            }
        );

    } catch (error) {
        console.error('Error handling access request:', error);
        bot.sendMessage(chatId, '❌ حدث خطأ. يرجى المحاولة لاحقا.');
    }
};

// Handle Callback Queries
bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;
    const telegramId = callbackQuery.from.id;
    const firstName = callbackQuery.from.first_name || '';
    const lastName = callbackQuery.from.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (data === 'refresh_link') {
        // Answer callback to stop loading animation
        bot.answerCallbackQuery(callbackQuery.id, { text: 'جاري تحديث الرابط...' });

        // Delete the old message to keep chat clean
        try {
            await bot.deleteMessage(chatId, message.message_id);
        } catch (e) {
            console.error('Could not delete message:', e);
        }

        // Generate new link
        await handleAccessRequest(chatId, telegramId, fullName, firstName);
    }
});

// Command: /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const firstName = msg.from.first_name || '';
    const lastName = msg.from.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    console.log(`User ${fullName} (${telegramId}) started bot`);
    await handleAccessRequest(chatId, telegramId, fullName, firstName);
});

// Handle legacy menu button
bot.on('message', async (msg) => {
    if (msg.text === '🚀 الدخول إلى الموقع') {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;
        const firstName = msg.from.first_name || '';
        const lastName = msg.from.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();

        console.log(`User ${fullName} (${telegramId}) clicked legacy button`);
        await handleAccessRequest(chatId, telegramId, fullName, firstName);
    }
});

// ... existing code ...

// Express server for Render
import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

console.log('🤖 Bot Telegram démarré!');
