import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { account, databases, DATABASE_ID } from '../lib/appwrite';
import { Query } from 'appwrite';

const TelegramLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('جاري التحقق...');

    useEffect(() => {
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        if (!userId || !secret) {
            setStatus('error');
            setMessage('رابط غير صالح');
            return;
        }

        authenticateWithSecret(userId, secret);
    }, [searchParams]);

    const authenticateWithSecret = async (userId, secret) => {
        try {
            // 1. Check if already logged in
            try {
                const currentAccount = await account.get();
                if (currentAccount.$id === userId) {
                    setStatus('success');
                    setMessage('تم تسجيل الدخول بالفعل! جاري التحويل...');
                    setTimeout(() => navigate('/activities'), 1000);
                    return;
                } else {
                    // Logged in as different user -> Logout
                    console.warn(`Mismatch! Current: ${currentAccount.$id}, Link: ${userId}`);
                    // Temporary: Show this to user to debug
                    // setMessage(`Debug: Mismatch. Current: ${currentAccount.$id}, Link: ${userId}`);
                    // await new Promise(r => setTimeout(r, 3000));

                    await account.deleteSession('current');
                }
            } catch (e) {
                // Not logged in, proceed
            }

            // 2. Create session using the secret
            await account.createSession(userId, secret);

            setStatus('success');
            setMessage('تم تسجيل الدخول بنجاح! جاري التحويل...');

            setTimeout(() => {
                navigate('/activities');
            }, 2000);

        } catch (error) {
            // Handle specific case where session might have been created in parallel or race condition
            if (error.message.includes('session is active')) {
                setStatus('success');
                setMessage('تم تسجيل الدخول! جاري التحويل...');
                setTimeout(() => navigate('/activities'), 2000);
                return;
            }

            // Check if it's an invalid token error
            if (error.message.includes('Invalid token') || error.message.includes('invalid') || error.code === 401) {
                setMessage('انتهت صلاحية الوصل السابقة. المرجو الرجوع إلى الخادم وتحديث الرابط');
            } else {
                setMessage(`حدث خطأ أثناء تسجيل الدخول: ${error.message}`);
            }
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                textAlign: 'center'
            }}>
                <img src="/logo.png" alt="Logo" style={{ width: '100px', marginBottom: '20px' }} />

                <h1 style={{
                    fontSize: '1.8rem',
                    marginBottom: '10px',
                    color: '#0f172a'
                }}>
                    جمعية الجوار
                </h1>

                <div style={{
                    fontSize: '3rem',
                    margin: '30px 0'
                }}>
                    {status === 'loading' && '⏳'}
                    {status === 'success' && '✅'}
                    {status === 'error' && '❌'}
                </div>

                <p style={{
                    fontSize: '1.2rem',
                    color: status === 'error' ? '#dc2626' : status === 'success' ? '#059669' : '#64748b',
                    marginBottom: '20px'
                }}>
                    {message}
                </p>

                {status === 'error' && (
                    <button
                        onClick={() => window.location.href = 'https://t.me/jiwar_association_bot'}
                        style={{
                            background: '#0088cc',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            marginTop: '20px'
                        }}
                    >
                        العودة إلى البوت
                    </button>
                )}
            </div>
        </div>
    );
};

export default TelegramLogin;
