import React, { useState } from 'react';
import { X } from 'lucide-react';

const ActivityForm = ({ onSubmit, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        eventDate: initialData?.event_date || '',
        registrationDeadline: initialData?.registration_deadline || '',
        location: initialData?.location || '',
        contributionAmount: initialData?.contribution_amount || '',
        organizingCommittee: initialData?.organizing_committee || '',
        description: initialData?.description || '',
        maxParticipants: initialData?.max_participants || ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (new Date(formData.registrationDeadline) >= new Date(formData.eventDate)) {
            setError('تاريخ انتهاء التسجيل يجب أن يكون قبل تاريخ الحدث');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await onSubmit(formData);
        } catch (err) {
            setError('فشل حفظ النشاط: ' + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{initialData ? 'تعديل النشاط' : 'إنشاء نشاط جديد'}</h2>
                    <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                            عنوان النشاط <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="مثال: ورشة تطوير المهارات"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                                تاريخ الحدث <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <input
                                type="date"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                                آخر موعد للتسجيل <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <input
                                type="date"
                                name="registrationDeadline"
                                value={formData.registrationDeadline}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                            المكان <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="مثال: قاعة المؤتمرات - الطابق الثاني"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                            اللجنة المنظمة <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="organizingCommittee"
                            value={formData.organizingCommittee}
                            onChange={handleChange}
                            required
                            placeholder="مثال: لجنة التطوير والتدريب"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                                المبلغ (درهم) - اختياري
                            </label>
                            <input
                                type="number"
                                name="contributionAmount"
                                value={formData.contributionAmount}
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                                الحد الأقصى للمشاركين - اختياري
                            </label>
                            <input
                                type="number"
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                                min="1"
                                placeholder="غير محدود"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                            وصف النشاط - اختياري
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="تفاصيل إضافية عن النشاط..."
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-outline"
                            disabled={loading}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'جاري الحفظ...' : (initialData ? 'تحديث' : 'إنشاء النشاط')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivityForm;
