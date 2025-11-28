import React from 'react';
import { BookOpen, Award, Scale, ShieldCheck } from 'lucide-react';

const ReferenceGuide = () => {
    const classifications = [
        { range: '90-100', label: 'الصفوة', color: '#10b981' }, // Green
        { range: '75-89', label: 'المتميزون', color: '#3b82f6' }, // Blue
        { range: '50-74', label: 'المحوريون', color: '#f59e0b' }, // Orange
        { range: '25-49', label: 'الصاعدون', color: '#8b5cf6' }, // Purple
        { range: '0-24', label: 'المتراجعون', color: '#ef4444' }, // Red
    ];

    return (
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '10px' }}>الدليل المرجعي للنظام</h1>
                <p style={{ color: '#64748b' }}>شرح معايير التصنيف والحقوق والامتيازات</p>
            </div>

            {/* Classification Section */}
            <div style={{
                backgroundColor: '#eff6ff',
                borderRadius: '16px',
                padding: '30px',
                marginBottom: '40px',
                border: '1px solid #dbeafe',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ color: '#1e40af', textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem' }}>
                    1. تصنيف الفعالية (0-100%)
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
                    {classifications.map((item, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                                <span style={{ fontWeight: 'bold', color: '#334155' }}>{item.label}</span>
                            </div>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#64748b' }}>{item.range}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                {/* Rights & Privileges */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                        <ShieldCheck size={24} color="#0f172a" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>الحقوق والامتيازات</h3>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>•</span>
                            <span><strong>رئاسة لجنة:</strong> معدل ≥ 75% + 6 أشهر خبرة.</span>
                        </li>
                        <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>•</span>
                            <span><strong>عضوية لجنة:</strong> معدل ≥ 60% للانضمام.</span>
                        </li>
                        <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>•</span>
                            <span><strong>البقاء في اللجنة:</strong> الحفاظ على معدل ≥ 50%.</span>
                        </li>
                        <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>•</span>
                            <span><strong>الامتيازات:</strong> تخفيضات، أولوية في السفر، شهادات.</span>
                        </li>
                    </ul>
                </div>

                {/* Dual Point System Calculation */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                        <Scale size={24} color="#0f172a" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>نظام النقاط المزدوج (العدالة)</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
                            يتم حساب المعدل النهائي بناءً على معادلة تضمن العدالة بين جودة المشاركة وكثرة المساهمة:
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <div>
                                <span style={{ display: 'block', fontWeight: 'bold', color: '#166534' }}>نقاط الجودة (Quality)</span>
                                <span style={{ fontSize: '0.8rem', color: '#15803d' }}>متوسط تقييمات الأداء</span>
                            </div>
                            <span style={{ fontWeight: '900', color: '#166534', fontSize: '1.2rem' }}>70%</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#cbd5e1' }}>+</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                            <div>
                                <span style={{ display: 'block', fontWeight: 'bold', color: '#1e40af' }}>نقاط المساهمة (Contribution)</span>
                                <span style={{ fontSize: '0.8rem', color: '#1d4ed8' }}>+10 نقاط لكل نشاط</span>
                            </div>
                            <span style={{ fontWeight: '900', color: '#1e40af', fontSize: '1.2rem' }}>30%</span>
                        </div>

                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', color: '#475569' }}>
                            <strong>المعادلة:</strong> (معدل الجودة × 0.7) + (مجموع نقاط المساهمة × 0.3)
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReferenceGuide;
