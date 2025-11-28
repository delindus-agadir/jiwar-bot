import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, Calendar } from 'lucide-react';

const WelcomePage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '900px',
                width: '100%'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '50px', color: 'white' }}>
                    <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                        مرحباً بك
                    </h1>
                    <p style={{ fontSize: '1.3rem', opacity: 0.9 }}>
                        نظام إدارة الأنشطة والتقييم
                    </p>
                </div>

                {/* Choice Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px'
                }}>
                    {/* Visitor Card */}
                    <div
                        onClick={() => navigate('/activities')}
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '40px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                        }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <Eye size={40} color="white" />
                        </div>

                        <h2 style={{ fontSize: '1.8rem', margin: '0 0 15px 0', color: '#0f172a' }}>
                            تصفح كزائر
                        </h2>

                        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px' }}>
                            استعرض الأنشطة المتاحة بدون تسجيل الدخول
                        </p>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#667eea',
                            fontWeight: '600'
                        }}>
                            <Calendar size={20} />
                            <span>عرض الأنشطة</span>
                        </div>
                    </div>

                    {/* Member Card */}
                    <div
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '40px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            textAlign: 'center',
                            border: '3px solid #667eea'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                        }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <Users size={40} color="white" />
                        </div>

                        <h2 style={{ fontSize: '1.8rem', margin: '0 0 15px 0', color: '#0f172a' }}>
                            تسجيل الدخول كعضو
                        </h2>

                        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px' }}>
                            سجل الدخول للتسجيل في الأنشطة وعرض تقييماتك
                        </p>

                        <div style={{
                            padding: '12px 20px',
                            background: '#f0fdf4',
                            borderRadius: '10px',
                            color: '#059669',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                        }}>
                            ✓ التسجيل في الأنشطة
                            <br />
                            ✓ عرض التقييمات
                            <br />
                            ✓ متابعة النقاط
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '40px',
                    color: 'white',
                    opacity: 0.8
                }}>
                    <p style={{ fontSize: '0.9rem' }}>
                        جمعية الجوار للأعمال الاجتماعية والثقافة والتنمية
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
