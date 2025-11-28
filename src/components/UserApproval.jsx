import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '../lib/appwrite';
import { Query } from 'appwrite';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const UserApproval = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await databases.listDocuments(
                DATABASE_ID,
                'users',
                [Query.equal('approved', false)]
            );
            setPendingUsers(response.documents);
        } catch (error) {
            console.error('Error fetching pending users:', error);
            setMessage({ type: 'error', text: 'خطأ في تحميل المستخدمين' });
        } finally {
            setLoading(false);
        }
    };

    const approveUser = async (userId, email) => {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                'users',
                userId,
                { approved: true }
            );
            setMessage({ type: 'success', text: `تم قبول ${email}` });
            fetchPendingUsers();
        } catch (error) {
            console.error('Error approving user:', error);
            setMessage({ type: 'error', text: 'خطأ في الموافقة' });
        }
    };

    const rejectUser = async (userId, email) => {
        if (!window.confirm(`هل أنت متأكد من رفض ${email}؟`)) return;

        try {
            // You can either delete the user or keep them as rejected
            // For now, we'll just keep them unapproved
            setMessage({ type: 'success', text: `تم رفض ${email}` });
            fetchPendingUsers();
        } catch (error) {
            console.error('Error rejecting user:', error);
            setMessage({ type: 'error', text: 'خطأ في الرفض' });
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>جاري التحميل...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={24} />
                المستخدمون في انتظار الموافقة ({pendingUsers.length})
            </h2>

            {message && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: message.type === 'success' ? '#059669' : '#dc2626'
                }}>
                    {message.text}
                </div>
            )}

            {pendingUsers.length === 0 ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    color: '#64748b'
                }}>
                    ✅ لا يوجد مستخدمون في انتظار الموافقة
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {pendingUsers.map((user) => (
                        <div
                            key={user.$id}
                            style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                    {user.email}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    تاريخ التسجيل: {new Date(user.$createdAt).toLocaleDateString('ar-EG')}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => approveUser(user.$id, user.email)}
                                    style={{
                                        background: '#059669',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    <CheckCircle size={18} />
                                    قبول
                                </button>
                                <button
                                    onClick={() => rejectUser(user.$id, user.email)}
                                    style={{
                                        background: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    <XCircle size={18} />
                                    رفض
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserApproval;
