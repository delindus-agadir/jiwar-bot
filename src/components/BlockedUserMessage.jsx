import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, AlertTriangle } from 'lucide-react';

const BlockedUserMessage = () => {
    const { logout } = useAuth();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f8fafc'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                maxWidth: '500px',
                width: '100%'
            }}>
                <div style={{
                    backgroundColor: '#fee2e2',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                }}>
                    <AlertTriangle size={32} color="#dc2626" />
                </div>

                <h1 style={{ color: '#1e293b', marginBottom: '10px', fontSize: '1.5rem' }}>حسابك محظور</h1>

                <p style={{ color: '#64748b', marginBottom: '20px', lineHeight: '1.6' }}>
                    تم حظر حسابك من قبل الإدارة. لا يمكنك الوصول إلى النظام في الوقت الحالي.
                </p>

                <div style={{
                    backgroundColor: '#f1f5f9',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '30px',
                    fontSize: '0.9rem',
                    color: '#475569'
                }}>
                    يرجى التواصل مع المسؤولين لمعرفة الأسباب أو لطلب إعادة تفعيل الحساب.
                </div>

                <button
                    onClick={logout}
                    className="btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    <LogOut size={18} />
                    تسجيل الخروج
                </button>
            </div>
        </div>
    );
};

export default BlockedUserMessage;
