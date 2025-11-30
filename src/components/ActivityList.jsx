import React, { useState, useEffect } from 'react';
import { Plus, Filter, Home, LogIn, LogOut, LayoutDashboard, ArrowRight, Users, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from './ActivityCard';
import ActivityForm from './ActivityForm';
import ActivityParticipants from './ActivityParticipants';
import { getActivities, createActivity, updateActivity, deleteActivity, registerForActivity, getMemberByUserId, cancelRegistration, getMemberRegistrations } from '../utils/db';
import { listDependentsByParent } from '../lib/dependents';
import { useAuth } from '../contexts/AuthContext';

const RegistrationModal = ({ activity, member, myDependents, currentRegistrations, onClose, onConfirm }) => {
    const [selected, setSelected] = useState(new Set(currentRegistrations));
    const [submitting, setSubmitting] = useState(false);

    const toggleSelection = (id) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            await onConfirm(Array.from(selected));
            onClose();
        } catch (error) {
            console.error('Registration error:', error);
            alert('حدث خطأ أثناء التسجيل');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">التسجيل في النشاط</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">{activity.title}</h4>
                    <p className="text-sm text-gray-500 mb-4">حدد الأشخاص المراد تسجيلهم:</p>

                    <div className="space-y-3">
                        {/* Member (Self) */}
                        <div
                            onClick={() => toggleSelection('self')}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selected.has('self') ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selected.has('self') ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                    }`}>
                                    {selected.has('self') && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="font-medium text-gray-700">أنا ({member.name})</span>
                            </div>
                        </div>

                        {/* Dependents */}
                        {myDependents.map(dep => (
                            <div
                                key={dep.$id}
                                onClick={() => toggleSelection(dep.$id)}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selected.has(dep.$id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selected.has(dep.$id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                        }`}>
                                        {selected.has(dep.$id) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 block">{dep.name}</span>
                                        <span className="text-xs text-gray-500">{dep.relationship}</span>
                                    </div>
                                </div>
                                {dep.approved ? (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">معتمد</span>
                                ) : (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">قيد المراجعة</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {submitting ? 'جاري الحفظ...' : 'تأكيد التسجيل'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ActivityList = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [filter, setFilter] = useState('open'); // Default to open activities
    const [loading, setLoading] = useState(false);
    const [registrations, setRegistrations] = useState({});
    const [myDependents, setMyDependents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [selectedActivityForRegistration, setSelectedActivityForRegistration] = useState(null);

    const { currentUser, userRole, hasMembership, isApproved, currentMember, logout } = useAuth();

    // Admins and editors can create activities
    const canCreate = userRole === 'admin' || userRole === 'editor';

    // Function to check if user can edit/delete a specific activity
    const canEditActivity = (activity) => {
        if (userRole === 'admin') return true; // Admins can edit everything
        if (userRole === 'editor' && activity.created_by === currentUser.$id) return true; // Editors can only edit their own
        return false;
    };

    const canRegister = hasMembership && isApproved; // Only approved members with profile can register

    useEffect(() => {
        fetchActivities();
    }, [currentUser]);

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
                    // Fetch dependents
                    // Fetch dependents
                    const deps = await listDependentsByParent(currentUser.$id);
                    setMyDependents(deps.documents);

                    // Fetch all registrations for this member (includes dependents)
                    const allRegs = await getMemberRegistrations(member.$id);

                    const regsMap = {};
                    allRegs.forEach(reg => {
                        if (!regsMap[reg.activity_id]) {
                            regsMap[reg.activity_id] = [];
                        }
                        // If dependent_id is null, it's 'self'
                        regsMap[reg.activity_id].push(reg.dependent_id || 'self');
                    });
                    setRegistrations(regsMap);
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
            filtered = activities.filter(a => {
                if (a.status !== 'open') return false;

                // Combine date and time for accurate comparison
                const deadlineDateTime = new Date(`${a.registration_deadline}T${a.registration_deadline_time || '23:59'}`);
                const now = new Date();

                return deadlineDateTime >= now;
            });
        } else if (filter === 'closed') {
            filtered = activities.filter(a => {
                if (a.status === 'closed') return true;

                const deadlineDateTime = new Date(`${a.registration_deadline}T${a.registration_deadline_time || '23:59'}`);
                const now = new Date();

                return deadlineDateTime < now;
            });
        } else if (filter === 'my') {
            filtered = activities.filter(a => registrations[a.$id] && registrations[a.$id].length > 0);
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

    const openRegistrationModal = (activity) => {
        setSelectedActivityForRegistration(activity);
        setShowRegistrationModal(true);
    };

    const handleRegistrationConfirm = async (selectedIds) => {
        const activityId = selectedActivityForRegistration.$id;
        const currentRegs = registrations[activityId] || [];
        const member = await getMemberByUserId(currentUser.$id);

        // Determine who to register (in selected but not in current)
        const toRegister = selectedIds.filter(id => !currentRegs.includes(id));

        // Determine who to unregister (in current but not in selected)
        const toUnregister = currentRegs.filter(id => !selectedIds.includes(id));

        // Process registrations
        for (const id of toRegister) {
            const dependentId = id === 'self' ? null : id;
            await registerForActivity(activityId, member.$id, 'attended', dependentId);
        }

        // Process unregistrations
        for (const id of toUnregister) {
            const dependentId = id === 'self' ? null : id;
            await cancelRegistration(activityId, member.$id, dependentId);
        }

        alert('تم تحديث التسجيل بنجاح! ✓');
        fetchActivities();
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
                    onClick={() => navigate('/dashboard')}
                    className="btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'white',
                        color: '#0f172a',
                        border: '1px solid #e2e8f0'
                    }}
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
                            onRegister={() => openRegistrationModal(activity)}
                            onUnregister={() => openRegistrationModal(activity)} // Same modal for managing
                            isRegistered={registrations[activity.$id] && registrations[activity.$id].length > 0}
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
                    activityLocation={selectedActivityForParticipants.location}
                    activityDate={selectedActivityForParticipants.event_date}
                    activityTime={selectedActivityForParticipants.event_time}
                    currentMember={currentMember}
                    onClose={() => {
                        setShowParticipants(false);
                        setSelectedActivityForParticipants(null);
                    }}
                />
            )}

            {showRegistrationModal && selectedActivityForRegistration && (
                <RegistrationModal
                    activity={selectedActivityForRegistration}
                    member={currentMember}
                    myDependents={myDependents}
                    currentRegistrations={registrations[selectedActivityForRegistration.$id] || []}
                    onClose={() => {
                        setShowRegistrationModal(false);
                        setSelectedActivityForRegistration(null);
                    }}
                    onConfirm={handleRegistrationConfirm}
                />
            )}
        </div>
    );
};

export default ActivityList;
