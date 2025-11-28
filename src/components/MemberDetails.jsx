import React from 'react';

const MemberDetails = ({ member, onClose, onDeleteEvaluation, onDeleteMember, currentUser, onEditEvaluation, canEdit }) => {
    if (!member) return null;

    return (
        <div className="card" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>سجل: {member.name}</h2>
                <button className="btn btn-outline" onClick={onClose}>إغلاق</button>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h3>التقييمات السابقة</h3>
                {member.evaluations.length === 0 ? (
                    <p style={{ color: 'var(--text-light)' }}>لا توجد تقييمات مسجلة.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'right' }}>
                                <th style={{ padding: '10px' }}>التاريخ</th>
                                <th style={{ padding: '10px' }}>النقاط</th>
                                <th style={{ padding: '10px' }}>الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {member.evaluations.map((ev, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{new Date(ev.date).toLocaleDateString('ar-EG')}</td>
                                    <td style={{ padding: '10px' }}>{ev.score} / {ev.maxScore}</td>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {(canEdit || (ev.creator_id && currentUser?.$id === ev.creator_id)) && (
                                                <button
                                                    style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    onClick={() => onEditEvaluation(member.id, ev, idx)}
                                                >
                                                    تعديل
                                                </button>
                                            )}
                                            <button
                                                style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                                onClick={() => {
                                                    console.log("Delete clicked for evaluation:", ev.id);
                                                    if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
                                                        onDeleteEvaluation(member.id, ev.id);
                                                    }
                                                }}
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <button
                    className="btn"
                    style={{ backgroundColor: '#fee2e2', color: '#dc2626', width: '100%' }}
                    onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا العضو نهائياً؟')) {
                            onDeleteMember(member.id);
                        }
                    }}
                >
                    حذف العضو نهائياً
                </button>
            </div>
        </div>
    );
};

export default MemberDetails;
