import React, { useState } from 'react';

const ParticipationLevelSelector = ({ onSelect, onCancel, currentLevel = 'attended' }) => {
    const [level, setLevel] = useState(currentLevel);
    const [roleDescription, setRoleDescription] = useState('');

    const levels = [
        { value: 'attended', label: 'حضرت فقط', points: 6, color: '#10b981', description: 'حضور النشاط دون مشاركة فعالة' },
        { value: 'participated', label: 'شاركت فعلياً', points: 8, color: '#3b82f6', description: 'مشاركة نشطة في الفعاليات' },
        { value: 'had_role', label: 'قمت بدور', points: 12, color: '#8b5cf6', description: 'تولي مسؤولية أو دور محدد' }
    ];

    const handleSubmit = () => {
        if (level === 'had_role' && !roleDescription.trim()) {
            alert('يرجى وصف الدور الذي قمت به');
            return;
        }
        onSelect(level, roleDescription);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                <h3 style={{ marginBottom: '20px' }}>اختر مستوى مشاركتك</h3>

                <div style={{ marginBottom: '20px' }}>
                    {levels.map(l => (
                        <div
                            key={l.value}
                            onClick={() => setLevel(l.value)}
                            style={{
                                padding: '15px',
                                marginBottom: '10px',
                                border: `2px solid ${level === l.value ? l.color : '#e2e8f0'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: level === l.value ? `${l.color}10` : 'white',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="radio"
                                        checked={level === l.value}
                                        onChange={() => setLevel(l.value)}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <strong style={{ fontSize: '1.1rem' }}>{l.label}</strong>
                                </div>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: l.color,
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    +{l.points} نقطة
                                </span>
                            </div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', paddingRight: '30px' }}>
                                {l.description}
                            </p>
                        </div>
                    ))}
                </div>

                {level === 'had_role' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            وصف الدور الذي قمت به <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <textarea
                            value={roleDescription}
                            onChange={(e) => setRoleDescription(e.target.value)}
                            placeholder="مثال: منسق الفعالية، مسؤول الاستقبال، متحدث رئيسي..."
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} className="btn btn-outline">
                        إلغاء
                    </button>
                    <button onClick={handleSubmit} className="btn btn-primary">
                        تأكيد التسجيل
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParticipationLevelSelector;
