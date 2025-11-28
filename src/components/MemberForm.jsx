import React, { useState } from 'react';

const MemberForm = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        matricule: initialData?.matricule || initialData?.Matricule || '',
        role: initialData?.role || 'منخرط',
        grade: initialData?.grade ? parseInt(initialData.grade) : 1,
        joinDate: initialData?.join_date || new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="card" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, width: '90%', maxWidth: '500px' }}>
            <h2>{initialData ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>الاسم الكامل</label>
                    <input
                        type="text"
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>رقم العضوية (Matricule)</label>
                    <input
                        type="number"
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        value={formData.matricule}
                        onChange={e => setFormData({ ...formData, matricule: e.target.value })}
                    />
                </div>

                {/* Role field hidden - not needed for now
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>الصفة / الدور</label>
                    <input
                        type="text"
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                    />
                </div>
                */}

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>الدرجة (1-5)</label>
                    <select
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        value={formData.grade}
                        onChange={e => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                    >
                        <option value="1">الدرجة 1: الأنشطة المفتوحة</option>
                        <option value="2">الدرجة 2: المنخرطون</option>
                        <option value="3">الدرجة 3: أعضاء اللجان</option>
                        <option value="4">الدرجة 4: رؤساء اللجان ونوابهم</option>
                        <option value="5">الدرجة 5: المكتب المسير</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>تاريخ الانضمام</label>
                    <input
                        type="date"
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        value={formData.joinDate}
                        onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                    />
                </div>

                <div className="flex" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" className="btn btn-outline" onClick={onCancel}>إلغاء</button>
                    <button type="submit" className="btn btn-primary">حفظ</button>
                </div>
            </form>
        </div>
    );
};

export default MemberForm;
