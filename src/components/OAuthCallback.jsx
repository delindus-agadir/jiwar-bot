import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            try {
                // Wait longer for session to be established (Appwrite needs time for cross-origin cookies)
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Try to get current session
                const session = await account.get();

                if (session) {
                    console.log('✅ Session established:', session);
                    // Session OK, redirect to dashboard
                    navigate('/dashboard');
                } else {
                    throw new Error('No session');
                }
            } catch (err) {
                console.error('❌ OAuth callback error:', err);
                setError('Échec de la connexion. Redirection...');

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        };

        checkSession();
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        }}>
            <div style={{ fontSize: '4rem' }}>
                {error ? '❌' : '🔄'}
            </div>
            <h2 style={{ margin: 0 }}>
                {error || 'جاري تسجيل الدخول...'}
            </h2>
            <p style={{ opacity: 0.9 }}>يرجى الانتظار (3 ثواني)</p>
            {error && (
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    إعادة التوجيه إلى صفحة تسجيل الدخول...
                </p>
            )}
        </div>
    );
};

export default OAuthCallback;
