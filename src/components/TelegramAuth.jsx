import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { databases, DATABASE_ID } from '../lib/appwrite';
import { Query } from 'appwrite';

const TelegramAuth = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('جاري التحقق...');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('رابط غير صالح');
            return;
        }
        handleAuth(token);
    }, [searchParams]);

    const handleAuth = async (token) => {
        try {
            // 1. Verify token
            const response = await databases.listDocuments(
                DATABASE_ID,
                'magic_links',
                [Query.equal('token', token)]
            );

            if (response.documents.length === 0) {
                setStatus('رابط غير صالح أو منتهي الصلاحية');
                return;
            }

            const tokenDoc = response.documents[0];

            if (tokenDoc.used) {
                setStatus('تم استخدام هذا الرابط بالفعل');
                return;
            }

            if (new Date(tokenDoc.expires_at) < new Date()) {
                setStatus('انتهت صلاحية الرابط');
                return;
            }

            const telegramId = tokenDoc.telegram_id;

            // 2. Check if member exists with this Telegram ID
            const memberResponse = await databases.listDocuments(
                DATABASE_ID,
                'members',
                [Query.equal('telegram_id', telegramId)]
            );

            if (memberResponse.documents.length > 0) {
                // Member exists -> Go to Login flow
                console.log('✅ Member found:', memberResponse.documents[0]);
                navigate(`/telegram-login?token=${token}`);
            } else {
                // Member does not exist -> Go to Signup flow
                console.warn('⚠️ Member NOT found for Telegram ID:', telegramId);
                console.log('Query result:', memberResponse);
                navigate(`/telegram-signup?token=${token}`);
            }

        } catch (error) {
            console.error('Auth error:', error);
            setStatus(`حدث خطأ أثناء التحقق: ${error.message}`);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '40px' }}>🔄</div>
            <div style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center' }}>
                {status}
            </div>
            {status.includes('NetworkError') && (
                <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', maxWidth: '80%', wordBreak: 'break-all' }}>
                    <p><strong>⚠️ Aide au débogage :</strong></p>
                    <p>Assurez-vous que ce domaine est ajouté dans Appwrite Platforms :</p>
                    <code style={{ background: '#ddd', padding: '5px', display: 'block', margin: '10px 0', fontSize: '1.2em' }}>
                        {window.location.hostname}
                    </code>
                    <p style={{ fontSize: '0.8em', color: '#888' }}>
                        Project ID: {DATABASE_ID.split('0')[0]}...<br />
                        Endpoint: https://fra.cloud.appwrite.io/v1
                    </p>
                </div>
            )}
        </div>
    );
};

export default TelegramAuth;
