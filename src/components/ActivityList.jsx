import React, { useState, useEffect } from 'react';
import { Plus, Filter, Home, LogIn, LogOut, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from './ActivityCard';
import ActivityForm from './ActivityForm';
import ActivityParticipants from './ActivityParticipants';
import { getActivities, createActivity, updateActivity, deleteActivity, registerForActivity, checkIfRegistered, getMemberByUserId, cancelRegistration } from '../utils/db';
import { useAuth } from '../contexts/AuthContext';

const ActivityList = () => {
    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [filter, setFilter] = useState('open'); // Default to open activities
    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [showParticipants, setShowParticipants] = useState(false);
    const [selectedActivityForParticipants, setSelectedActivityForParticipants] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrations, setRegistrations] = useState({});

    const navigate = useNavigate();
    const { currentUser, userRole, hasMembership, logout } = useAuth();

    // Admins and editors can create activities
    const canCreate = userRole === 'admin' || userRole === 'editor';

    // Function to check if user can edit/delete a specific activity
    const canEditActivity = (activity) => {
        if (userRole === 'admin') return true; // Admins can edit everything
        if (userRole === 'editor' && activity.created_by === currentUser.$id) return true; // Editors can only edit their own
        return false;
    };

    const canRegister = hasMembership; // Anyone with a member profile can register

    useEffect(() => {
        fetchActivities();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [activities, filter, registrations]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const data = await getActivities();
            setActivities(data);

            // Check registrations for current user
            if (currentUser && hasMembership) {
                // First, get the member ID for this user
                const member = await getMemberByUserId(currentUser.$id);
                if (member) {
                    const regs = {};
                    for (const activity of data) {
                        const isReg = await checkIfRegistered(activity.$id, member.$id);
                        regs[activity.$id] = isReg;
                    }
                    setRegistrations(regs);
                }
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        let filtered = activities;

        if (filter === 'open') {
            filtered = activities.filter(a =>
                a.status === 'open' &&
                new Date(a.registration_deadline) >= new Date()
            );
        } else if (filter === 'closed') {
            filtered = activities.filter(a =>
                a.status === 'closed' ||
                new Date(a.registration_deadline) < new Date()
            );
        } else if (filter === 'my') {
            filtered = activities.filter(a => registrations[a.$id]);
        }

        // Sort by event date (upcoming first)
        filtered.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

        setFilteredActivities(filtered);
    };

    const handleCreate = async (activityData) => {
        await createActivity(activityData, currentUser.$id);
        setShowForm(false);
        fetchActivities();
    };

    const handleUpdate = async (activityData) => {
        await updateActivity(editingActivity.$id, activityData);
        setEditingActivity(null);
        setShowForm(false);
        fetchActivities();
    };

    const handleDelete = async (activityId) => {
        if (window.confirm('هل أنت متأكد من حذف هذا النشاط؟')) {
            await deleteActivity(activityId);
            fetchActivities();
        }
    };

    const handleRegister = async (activityId) => {
        try {
            // Get member ID for current user
            const member = await getMemberByUserId(currentUser.$id);
            if (!member) {
                alert('لم يتم العثور على ملف العضوية الخاص بك');
                return;
            }

            await registerForActivity(activityId, member.$id);
            alert('تم التسجيل بنجاح! ✓');
            fetchActivities();
        } catch (error) {
            alert('فشل التسجيل: ' + error.message);
        }
    };

    const handleUnregister = async (activityId) => {
        if (!window.confirm('هل أنت متأكد من إلغاء التسجيل؟')) {
            return;
        }

        try {
            // Get member ID and find the registration
            const member = await getMemberByUserId(currentUser.$id);
            if (!member) {
                alert('لم يتم العثور على ملف العضوية الخاص بك');
                return;
            }

            // We need to find the registration ID first
            // For now, we'll use cancelRegistration which will handle it
            await cancelRegistration(activityId, member.$id);
            alert('تم إلغاء التسجيل بنجاح');
            fetchActivities();
        } catch (error) {
            alert('فشل إلغاء التسجيل: ' + error.message);
        }
    };

    const openEditForm = (activity) => {
        setEditingActivity(activity);
        setShowForm(true);
    };

    return (
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {/* Navigation Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                padding: '15px 20px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowRight size={20} />
                    الصفحة الرئيسية
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {currentUser ? (
                        <>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                <LayoutDashboard size={20} />
                                لوحة التحكم
                            </button>
                            <button
                                onClick={logout}
                                className="btn"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                <LogOut size={20} />
                                تسجيل الخروج
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            <LogIn size={20} />
                            تسجيل الدخول
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: '0 0 5px 0' }}>الأنشطة</h1>
                        <p style={{ color: '#64748b', margin: 0 }}>تصفح وسجل في الأنشطة المتاحة</p>
                    </div>

                    {canCreate && (
                        <button
                            onClick={() => {
                                setEditingActivity(null);
                                setShowForm(true);
                            }}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={20} />
                            إنشاء نشاط جديد
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setFilter('all')}
                        className="btn"
                        style={{
                            background: filter === 'all' ? '#2563eb' : 'white',
                            color: filter === 'all' ? 'white' : '#64748b',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        الكل ({activities.length})
                    </button>
                    <button
                        onClick={() => setFilter('open')}
                        className="btn"
                        style={{
                            background: filter === 'open' ? '#059669' : 'white',
                            color: filter === 'open' ? 'white' : '#64748b',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        مفتوح
                    </button>
                    <button
                        onClick={() => setFilter('closed')}
                        className="btn"
                        style={{
                            background: filter === 'closed' ? '#64748b' : 'white',
                            color: filter === 'closed' ? 'white' : '#64748b',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        مغلق
                    </button>
                    {canRegister && (
                        <button
                            onClick={() => setFilter('my')}
                            className="btn"
                            style={{
                                background: filter === 'my' ? '#1e40af' : 'white',
                                color: filter === 'my' ? 'white' : '#64748b',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            تسجيلاتي
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
                    جاري التحميل...
                </div>
            ) : filteredActivities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📅</div>
                    <p style={{ fontSize: '1.1rem' }}>لا توجد أنشطة متاحة حالياً</p>
                </div>
            ) : (
                <div>
                    {filteredActivities.map(activity => (
                        <ActivityCard
                            key={activity.$id}
                            activity={activity}
                            onView={() => {/* TODO: Open details modal */ }}
                            onEdit={() => openEditForm(activity)}
                            onDelete={() => handleDelete(activity.$id)}
                            onRegister={() => handleRegister(activity.$id)}
                            onUnregister={() => handleUnregister(activity.$id)}
                            isRegistered={registrations[activity.$id]}
                            canEdit={canEditActivity(activity)}
                            canRegister={canRegister}
                            onViewParticipants={() => {
                                setSelectedActivityForParticipants(activity);
                                setShowParticipants(true);
                            }}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <ActivityForm
                    initialData={editingActivity}
                    onSubmit={editingActivity ? handleUpdate : handleCreate}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingActivity(null);
                    }}
                />
            )}

            {showParticipants && selectedActivityForParticipants && (
                <ActivityParticipants
                    activityId={selectedActivityForParticipants.$id}
                    activityTitle={selectedActivityForParticipants.title}
                    onClose={() => {
                        setShowParticipants(false);
                        setSelectedActivityForParticipants(null);
                    }}
                />
            )}
        </div>
    );
};

export default ActivityList;
