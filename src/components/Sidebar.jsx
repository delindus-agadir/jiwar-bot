import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, UserCog, BookOpen, Calendar, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout, userRole, currentUser, currentMember } = useAuth();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['admin', 'editor'] },
        { path: '/activities', label: 'الأنشطة', icon: Calendar },
        { path: '/profile', label: 'الملف الشخصي', icon: UserCog },
        { path: '/approvals', label: 'الموافقات', icon: UserCheck, roles: ['admin'] },
        { path: '/guide', label: 'الدليل المرجعي', icon: BookOpen },
    ];

    // Filter nav items based on user role
    const visibleNavItems = navItems.filter(item =>
        !item.roles || item.roles.includes(userRole)
    );

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <img src="/logo.png" alt="شعار الجمعية" style={{ width: '80px', height: 'auto' }} loading="lazy" />

                <div style={{ width: '100%' }}>
                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: '900', lineHeight: '1.2' }}>جمعية الجوار</h2>
                    <p style={{ margin: '0', color: '#0f172a', fontSize: '0.65rem', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
                        للأعمال الاجتماعية والثقافة والتنمية
                    </p>
                </div>

                <div style={{ width: '100%', height: '1px', background: '#e2e8f0', margin: '5px 0' }}></div>

                <h3 style={{ margin: 0, color: '#2563eb', fontSize: '1.1rem', fontWeight: 'bold' }}>نظام التنقيط والتحفيز</h3>
                <span style={{ fontSize: '0.6rem', color: '#cbd5e1', marginTop: '5px' }}>v1.0.1 (PWA)</span>

                {/* User Info Display */}
                <div style={{ marginTop: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' }}>
                        {currentMember?.name || currentUser?.name || 'مستخدم'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        {userRole === 'admin' ? 'مسؤول النظام' : userRole === 'editor' ? 'محرر' : userRole === 'member' ? 'عضو' : 'زائر'}
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '20px 10px' }}>
                {visibleNavItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose} // Close sidebar on mobile when link is clicked
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 15px',
                            borderRadius: '8px',
                            marginBottom: '5px',
                            textDecoration: 'none',
                            color: isActive(item.path) ? '#2563eb' : '#64748b',
                            backgroundColor: isActive(item.path) ? '#eff6ff' : 'transparent',
                            fontWeight: isActive(item.path) ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}

                {/* Placeholder for visual match with screenshot */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 15px',
                    color: '#94a3b8',
                    cursor: 'not-allowed'
                }}>
                    <Users size={20} />
                    <span>الأعضاء (قريباً)</span>
                </div>
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
                {userRole === 'admin' && (
                    <button
                        onClick={() => {
                            document.dispatchEvent(new CustomEvent('openUserManagement'));
                            onClose();
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '12px 15px',
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            textAlign: 'right',
                            fontSize: '1rem'
                        }}
                    >
                        <UserCog size={20} />
                        <span>إدارة المستخدمين</span>
                    </button>
                )}

                <button
                    onClick={logout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '12px 15px',
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        textAlign: 'right',
                        fontSize: '1rem',
                        marginTop: '5px'
                    }}
                >
                    <LogOut size={20} />
                    <span>تسجيل خروج</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

