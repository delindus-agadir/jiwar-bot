import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '../lib/appwrite';
import { Query } from 'appwrite';
import { CheckCircle, XCircle, Clock, User, Users } from 'lucide-react';

const UserApproval = () => {
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'dependents'
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingDependents, setPendingDependents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            await Promise.all([fetchPendingUsers(), fetchPendingDependents()]);
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'خطأ في تحميل البيانات' });
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingUsers = async () => {
        // 1. Fetch unapproved users from Auth (users collection in our case refers to Appwrite Auth users, but we query 'users' collection if we have one, or 'members'?)
        // In this system, we seem to have a 'users' collection that mirrors Auth users or stores extra data?
        // Let's stick to previous logic: Query 'users' collection for approved=false

        try {
            const usersResponse = await databases.listDocuments(
                DATABASE_ID,
                'users',
                [Query.equal('approved', false)]
            );

            const users = usersResponse.documents;

            if (users.length > 0) {
                // 2. Fetch corresponding member details
                const userIds = users.map(u => u.$id);
                const membersResponse = await databases.listDocuments(
                    DATABASE_ID,
                    'members',
                    [Query.equal('user_id', userIds)]
                );

                // 3. Merge data
                const enrichedUsers = users.map(user => {
                    const member = membersResponse.documents.find(m => m.user_id === user.$id);
                    return {
                        ...user,
                        memberName: member ? member.name : 'Unknown',
                        memberGrade: member ? member.grade : '-',
                        telegram_id: member ? member.telegram_id : null
                    };
                });

                setPendingUsers(enrichedUsers);
            } else {
                setPendingUsers([]);
            }
        } catch (error) {
            console.error('Error fetching pending users:', error);
        }
    };

    const fetchPendingDependents = async () => {
        try {
            // Fetch pending dependents directly from members collection
            const result = await databases.listDocuments(
                DATABASE_ID,
                'members',
                [
                    Query.equal('approved', false),
                    Query.equal('is_dependent', true)
                ]
            );

            const deps = result.documents;

            if (deps.length > 0) {
                // Fetch parent details
                const parentIds = [...new Set(deps.map(d => d.parent_user_id))];

                // We need to fetch parent members to get their names
                // We can query members where user_id is in parentIds
                const membersResponse = await databases.listDocuments(
                    DATABASE_ID,
                    'members',
                    [Query.equal('user_id', parentIds)]
                );

                const enrichedDependents = deps.map(dep => {
                    const parent = membersResponse.documents.find(m => m.user_id === dep.parent_user_id);
                    return {
                        ...dep,
                        parentName: parent ? parent.name : 'Unknown',
                        parentTelegramId: parent ? parent.telegram_id : null
                    };
                });
                setPendingDependents(enrichedDependents);
            } else {
                setPendingDependents([]);
            }
        } catch (error) {
            console.error('Error fetching pending dependents:', error);
        }
    };

    const approveUser = async (userId, email, telegramId, name) => {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                'users',
                userId,
                { approved: true }
            );

            // Also update member status if needed? 
            // Previous logic didn't seem to update member status, just user status.
            // But for dependents, we definitely need to update member status.

            // Notify Member
            if (telegramId) {
                fetch('/.netlify/functions/notify-member', {
                    method: 'POST',
                    body: JSON.stringify({ telegramId, status: 'approved', name })
                }).catch(console.error);
            }

            setMessage({ type: 'success', text: `تم قبول ${email}` });
            fetchPendingUsers();
        } catch (error) {
            console.error('Error approving user:', error);
            setMessage({ type: 'error', text: 'خطأ في الموافقة' });
        }
    };

    const rejectUser = async (userId, email, telegramId, name) => {
        if (!window.confirm(`هل أنت متأكد من رفض ${email}؟`)) return;

        try {
            // Notify Member
            if (telegramId) {
                fetch('/.netlify/functions/notify-member', {
                    method: 'POST',
                    body: JSON.stringify({ telegramId, status: 'rejected', name })
                }).catch(console.error);
            }

            // Delete user or mark as rejected?
            // For now, let's assume we just leave them unapproved or delete?
            // Previous code didn't show delete logic, just notification.
            // Let's assume we delete the user document to clean up.
            await databases.deleteDocument(
                DATABASE_ID,
                'users',
                userId
            );

            setMessage({ type: 'success', text: `تم رفض ${email}` });
            fetchPendingUsers();
        } catch (error) {
            console.error('Error rejecting user:', error);
            setMessage({ type: 'error', text: 'خطأ في الرفض' });
        }
    };

    const approveDependent = async (dependent) => {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                'members',
                dependent.$id,
                { approved: true }
            );

            // Notify Parent
            if (dependent.parentTelegramId) {
                fetch('/.netlify/functions/notify-member', {
                    method: 'POST',
                    body: JSON.stringify({
                        telegramId: dependent.parentTelegramId,
                        status: 'dependent_approved',
                        dependentName: dependent.name
                    })
                }).catch(console.error);
            }

            setMessage({ type: 'success', text: `تم قبول الرعية ${dependent.name}` });
            fetchPendingDependents();
        } catch (error) {
            console.error('Error approving dependent:', error);
            setMessage({ type: 'error', text: 'خطأ في الموافقة على الرعية' });
        }
    };

    const rejectDependent = async (dependent) => {
        if (!window.confirm(`هل أنت متأكد من رفض الرعية ${dependent.name}؟`)) return;

        try {
            // Notify Parent
            if (dependent.parentTelegramId) {
                fetch('/.netlify/functions/notify-member', {
                    method: 'POST',
                    body: JSON.stringify({
                        telegramId: dependent.parentTelegramId,
                        status: 'dependent_rejected',
                        dependentName: dependent.name
                    })
                }).catch(console.error);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                'members',
                dependent.$id
            );

            setMessage({ type: 'success', text: `تم رفض الرعية ${dependent.name}` });
            fetchPendingDependents();
        } catch (error) {
            console.error('Error rejecting dependent:', error);
            setMessage({ type: 'error', text: 'خطأ في رفض الرعية' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                طلبات الانضمام المعلقة
            </h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors relative ${activeTab === 'users'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        الأعضاء ({pendingUsers.length})
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('dependents')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors relative ${activeTab === 'dependents'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        الرعايا ({pendingDependents.length})
                    </div>
                </button>
            </div>

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

            {activeTab === 'users' && (
                <>
                    {pendingUsers.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
                            ✅ لا يوجد أعضاء في انتظار الموافقة
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {pendingUsers.map((user) => (
                                <div key={user.$id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px', color: '#1e293b' }}>{user.memberName}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '2px' }}>{user.email}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>تاريخ التسجيل: {new Date(user.$createdAt).toLocaleDateString('ar-EG')}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => approveUser(user.$id, user.email, user.telegram_id, user.memberName)} style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <CheckCircle size={18} /> قبول
                                        </button>
                                        <button onClick={() => rejectUser(user.$id, user.email, user.telegram_id, user.memberName)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <XCircle size={18} /> رفض
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'dependents' && (
                <>
                    {pendingDependents.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
                            ✅ لا يوجد رعايا في انتظار الموافقة
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {pendingDependents.map((dep) => (
                                <div key={dep.$id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px', color: '#1e293b' }}>{dep.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '2px' }}>
                                            القرابة: {dep.role} | الولي: {dep.parentName}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                            المعرف: {dep.matricule}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => approveDependent(dep)} style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <CheckCircle size={18} /> قبول
                                        </button>
                                        <button onClick={() => rejectDependent(dep)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <XCircle size={18} /> رفض
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserApproval;
