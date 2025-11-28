import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MemberRegistrationForm = ({ onSubmit, currentUser }) => {
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        role: 'منخرط',
        grade: '',
        matricule: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.grade) {
            setError('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await onSubmit(formData);
            navigate('/');
        } catch (err) {
            setError('فشل إكمال التسجيل: ' + (err.message || err));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>مرحباً بك! 🎉</h2>
                    <p style={{ color: '#64748b' }}>يرجى إكمال بيانات العضوية لإتمام التسجيل</p>
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                            الاسم الكامل <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="أدخل اسمك الكامل"
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        />
                    </div>

                    {/* Role field hidden - not needed for now
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                            الصفة <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        >
                            <option value="">اختر الصفة...</option>
                            <option value="طالب">طالب</option>
                            <option value="موظف">موظف</option>
                            <option value="متطوع">متطوع</option>
                            <option value="أخرى">أخرى</option>
                        </select>
                    </div>
                    */}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                            الدرجة <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <select
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        >
                            <option value="">اختر الدرجة...</option>
                            <option value="1">الدرجة 1: الأنشطة المفتوحة</option>
                            <option value="2">الدرجة 2: المنخرطون</option>
                            <option value="3">الدرجة 3: أعضاء اللجان</option>
                            <option value="4">الدرجة 4: رؤساء اللجان ونوابهم</option>
                            <option value="5">الدرجة 5: المكتب المسير</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                            رقم العضوية (اختياري)
                        </label>
                        <input
                            type="text"
                            name="matricule"
                            value={formData.matricule}
                            onChange={handleChange}
                            placeholder="أدخل رقم العضوية إن وجد"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        />
                        <small style={{ color: '#64748b', fontSize: '0.875rem' }}>سيتم توليد رقم تلقائي إذا تركت هذا الحقل فارغًا</small>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', fontSize: '1.1rem', fontWeight: 'bold' }}
                    >
                        {loading ? 'جاري الحفظ...' : 'إكمال التسجيل'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    <p>بإكمال التسجيل، أنت توافق على شروط الاستخدام</p>
                </div>
            </div>
        </div>
    );
};

export default MemberRegistrationForm;
