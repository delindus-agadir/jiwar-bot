import React from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock, Edit, Trash2 } from 'lucide-react';

const ActivityCard = ({
    activity,
    onView,
    onEdit,
    onDelete,
    onRegister,
    onUnregister,
    onViewParticipants,
    isRegistered,
    canEdit,
    canRegister
}) => {
    const isDeadlinePassed = new Date(activity.registration_deadline) < new Date();
    const isFull = activity.max_participants && activity.current_participants >= activity.max_participants;
    const canRegisterNow = canRegister && !isDeadlinePassed && !isFull && !isRegistered;

    const getStatusBadge = () => {
        if (activity.status === 'cancelled') {
            return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', background: '#fee2e2', color: '#dc2626', fontWeight: '600' }}>ملغى</span>;
        }
        if (activity.status === 'closed') {
            return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', background: '#e2e8f0', color: '#64748b', fontWeight: '600' }}>مغلق</span>;
        }
        if (isDeadlinePassed) {
            return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', background: '#fef3c7', color: '#d97706', fontWeight: '600' }}>انتهى التسجيل</span>;
        }
        if (isFull) {
            return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', background: '#fef3c7', color: '#d97706', fontWeight: '600' }}>مكتمل</span>;
        }
        return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', background: '#d1fae5', color: '#059669', fontWeight: '600' }}>مفتوح</span>;
    };

    return (
        <div className="card" style={{ marginBottom: '20px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}
            onClick={onView}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', color: '#0f172a' }}>{activity.title}</h3>
                    {getStatusBadge()}
                </div>
                {isRegistered && (
                    <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', background: '#dbeafe', color: '#1e40af', fontWeight: '600' }}>
                        مسجل ✓
                    </span>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                    <Calendar size={18} />
                    <span>{new Date(activity.event_date).toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    {activity.event_time && <span style={{ marginRight: '5px', fontWeight: 'bold' }}>• {activity.event_time}</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                    <MapPin size={18} />
                    <span>{activity.location}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                    <Users size={18} />
                    <span style={{ fontWeight: 'bold' }}>{activity.current_participants || 0} مشارك</span>
                </div>

                {activity.contribution_amount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                        <DollarSign size={18} />
                        <span>{activity.contribution_amount} درهم</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', padding: '10px', background: '#f8fafc', borderRadius: '6px' }}>
                <Clock size={16} color="#64748b" />
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    آخر موعد للتسجيل: {new Date(activity.registration_deadline).toLocaleDateString('ar-EG-u-nu-latn')}
                    {activity.registration_deadline_time && <span style={{ marginRight: '5px', fontWeight: 'bold' }}>• {activity.registration_deadline_time}</span>}
                </span>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
                <strong>اللجنة المنظمة:</strong> {activity.organizing_committee}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                {canRegisterNow && (
                    <button
                        onClick={onRegister}
                        className="btn btn-primary"
                        style={{ flex: '1', minWidth: '120px' }}
                    >
                        سجل الآن
                    </button>
                )}

                {isRegistered && canRegister && (
                    <button
                        onClick={onUnregister}
                        className="btn"
                        style={{
                            flex: '1',
                            minWidth: '120px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none'
                        }}
                    >
                        إلغاء التسجيل
                    </button>
                )}

                {canEdit && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', width: '100%' }}>
                        <button
                            onClick={onViewParticipants}
                            className="btn btn-outline"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            title="عرض المشاركين"
                        >
                            <Users size={18} />
                            المشاركين
                        </button>
                        <button
                            onClick={onEdit}
                            className="btn btn-outline"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                        >
                            <Edit size={18} />
                            تعديل
                        </button>
                        <button
                            onClick={onDelete}
                            className="btn btn-outline"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#ef4444', borderColor: '#ef4444' }}
                        >
                            <Trash2 size={18} />
                            حذف
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityCard;
