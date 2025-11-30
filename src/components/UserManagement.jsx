import React, { useState, useEffect } from 'react';
import { client, databases, DATABASE_ID } from '../lib/appwrite';
import { updateUserRole, deleteUserFromDb, blockUser, unblockUser } from '../utils/db';
import { useAuth } from '../contexts/AuthContext';
import { Query } from 'appwrite';

const UserManagement = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const { currentUser, userRole } = useAuth();

    const fetchUsers = async () => {
        try {
            const response = await databases.listDocuments(DATABASE_ID, 'users');

            // Map documents to include id
            const usersData = response.documents.map(doc => ({
                ...doc,
                id: doc.$id
            }));

            // Fetch member names
            if (usersData.length > 0) {
                const userIds = usersData.map(u => u.id);
                const membersResponse = await databases.listDocuments(
                    DATABASE_ID,
                    'members',
                    [Query.equal('user_id', userIds)]
                );

                // Enrich users with member names
                const enrichedUsers = usersData.map(user => {
                    const member = membersResponse.documents.find(m => m.user_id === user.id);
                    return {
                        ...user,
                        memberName: member ? member.name : null
                    };
                });

                setUsers(enrichedUsers);
            } else {
                setUsers(usersData);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();

        // Subscribe to real-time changes
        const unsubscribe = client.subscribe(
            `databases.${DATABASE_ID}.collections.users.documents`,
            response => {
                fetchUsers();
            }
        );

        return () => {
            unsubscribe();
        };
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
        } catch (error) {
            console.error("Error updating role:", error);
            alert("حدث خطأ أثناء تحديث الصلاحية");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟ سيتم منعه من الوصول للنظام.")) {
            try {
                await deleteUserFromDb(userId);
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("فشل حذف المستخدم");
            }
        }
    };

    const handleInvite = () => {
        const url = window.location.origin + "/signup";
        navigator.clipboard.writeText(url);
        alert("تم نسخ رابط التسجيل! أرسله للمستخدم الجديد:\n" + url);
    };

    return (
        <div className="card" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <div>
                    <h2>إدارة المستخدمين</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '5px 0 0 0' }}>
                        مستخدم حالي: <strong>{currentUser?.email}</strong> | الصلاحية: <strong>{userRole === 'admin' ? 'مدير' : userRole === 'editor' ? 'مسجل' : 'مراقب'}</strong>
                    </p>
                </div>
                <div className="flex" style={{ gap: '10px' }}>
                    <button className="btn btn-primary" onClick={handleInvite} style={{ fontSize: '0.9rem' }}>+ دعوة مستخدم جديد</button>
                    <button className="btn btn-outline" onClick={onClose}>إغلاق</button>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'right' }}>
                        <th style={{ padding: '10px' }}>البريد الإلكتروني</th>
                        <th style={{ padding: '10px' }}>الصلاحية الحالية</th>
                        <th style={{ padding: '10px' }}>تغيير الصلاحية</th>
                        <th style={{ padding: '10px' }}>إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee', backgroundColor: user.id === currentUser?.$id ? '#f0f9ff' : 'transparent' }}>
                            <td style={{ padding: '10px' }}>
                                {user.memberName && (
                                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '2px' }}>
                                        {user.memberName}
                                    </div>
                                )}
                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    {user.email || 'User'}
                                    {user.id === currentUser?.$id && <span style={{ marginRight: '5px', color: '#2563eb', fontSize: '0.85rem' }}>(أنت)</span>}
                                </div>
                            </td>
                            <td style={{ padding: '10px' }}>
                                <span className="badge" style={{
                                    backgroundColor: user.role === 'admin' ? '#dc2626' : user.role === 'editor' ? '#2563eb' : '#64748b'
                                }}>
                                    {user.role === 'admin' ? 'مدير' : user.role === 'editor' ? 'مسجل' : 'مراقب'}
                                </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    style={{ padding: '5px', borderRadius: '4px' }}
                                    disabled={user.id === currentUser?.$id}
                                >
                                    <option value="viewer">مراقب</option>
                                    <option value="editor">مسجل</option>
                                    <option value="admin">مدير</option>
                                </select>
                            </td>
                            <td style={{ padding: '10px' }}>
                                {user.id !== currentUser?.$id && (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(user.blocked ? 'هل أنت متأكد من إلغاء حظر هذا المستخدم؟' : 'هل أنت متأكد من حظر هذا المستخدم؟')) {
                                                    try {
                                                        if (user.blocked) {
                                                            await unblockUser(user.id);
                                                        } else {
                                                            await blockUser(user.id);
                                                        }
                                                        fetchUsers();
                                                    } catch (error) {
                                                        alert('فشل تغيير حالة الحظر: ' + error.message);
                                                    }
                                                }
                                            }}
                                            style={{
                                                background: user.blocked ? '#dbeafe' : '#fef3c7',
                                                color: user.blocked ? '#1e40af' : '#d97706',
                                                border: 'none',
                                                padding: '5px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {user.blocked ? 'إلغاء الحظر' : 'حظر'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {users.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    لا يوجد مستخدمون بعد
                </div>
            )}
        </div>
    );
};

export default UserManagement;
