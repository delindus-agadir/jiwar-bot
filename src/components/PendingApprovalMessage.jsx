import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const PendingApprovalMessage = () => {
    const { logout } = useAuth();

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
                    fontSize: '4rem',
                    margin: '30px 0'
                }}>
                    ⏳
                </div>

                <h2 style={{
                    fontSize: '1.5rem',
                    color: '#0f172a',
                    marginBottom: '15px'
                }}>
                    حسابك قيد المراجعة
                </h2>

                <p style={{
                    fontSize: '1.1rem',
                    color: '#64748b',
                    marginBottom: '30px',
                    lineHeight: '1.6'
                }}>
                    شكرا لتسجيلك في جمعية الجوار!
                    <br />
                    <br />
                    حسابك الآن في انتظار الموافقة من قبل المسؤول.
                    <br />
                    ستتمكن من الدخول بمجرد الموافقة على حسابك.
                    <br />
                    <br />
                    يرجى التحقق مرة أخرى لاحقا.
                </p>

                <button
                    onClick={logout}
                    style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        marginTop: '20px'
                    }}
                >
                    تسجيل الخروج
                </button>

                <div style={{
                    marginTop: '30px',
                    padding: '15px',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#64748b'
                }}>
                    💡 <strong>نصيحة:</strong> يمكنك الاتصال بالإدارة للحصول على موافقة أسرع.
                </div>
            </div>
        </div>
    );
};

export default PendingApprovalMessage;
