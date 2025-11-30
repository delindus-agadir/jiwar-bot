import TelegramBot from 'node-telegram-bot-api';
import { Client, Databases, Users, ID, Query } from 'node-appwrite';
import crypto from 'crypto';

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
                'telegram_signups',
                ID.unique(),
                {
                    telegram_id: telegramId.toString(),
                    full_name: fullName,
                    token: token,
                    expires_at: expiresAt
                }
            );

            // Use HashRouter URL
            accessUrl = `${WEB_APP_URL}/#/telegram-signup?token=${token}`;
            buttonText = '📝 تسجيل عضوية جديدة';
            console.log(`Generated Signup URL for ${fullName}`);
        }

        // Send message with button
        await bot.sendMessage(chatId, `مرحباً ${firstName} 👋\n\nللمتابعة، يرجى النقر على الزر أدناه:`, {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: buttonText,
                        web_app: { url: accessUrl }
                    }
                ]]
            }
        });

    } catch (error) {
        console.error('Error handling access request:', error);
        await bot.sendMessage(chatId, '❌ حدث خطأ. يرجى المحاولة لاحقا.');
    }
};

export const handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        console.log('Received update:', JSON.stringify(body));

        // Handle Message
        if (body.message) {
            const chatId = body.message.chat.id;
            const text = body.message.text;
            const telegramId = body.message.from.id;
            const firstName = body.message.from.first_name || 'عضو';
            const lastName = body.message.from.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();

            if (text === '/start') {
                await handleAccessRequest(chatId, telegramId, fullName, firstName);
            }
        }
        // Handle Callback Query (if any)
        else if (body.callback_query) {
            const chatId = body.callback_query.message.chat.id;
            const telegramId = body.callback_query.from.id;
            const firstName = body.callback_query.from.first_name;
            const message = body.callback_query.message;

            if (body.callback_query.data === 'check_access') {
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
