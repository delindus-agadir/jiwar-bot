import React, { useState } from 'react';
import { CRITERIA } from '../utils/calculations';

const EvaluationForm = ({ member, onSubmit, onCancel, initialData }) => {
    const [scores, setScores] = useState(initialData?.details || {});
    // Ensure date is valid, otherwise default to today
    const [evaluationDate, setEvaluationDate] = useState(() => {
        if (initialData?.date) return initialData.date;
        return new Date().toISOString().split('T')[0];
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        let totalScore = 0;
        let maxPossible = CRITERIA.reduce((a, b) => a + b.max, 0);

        // Check if manual score was entered
        if (scores.manual !== undefined) {
            totalScore = scores.manual;
        } else {
            // Calculate from criteria
            totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        }

        const evaluation = {
            date: evaluationDate,
            score: totalScore,
            maxScore: maxPossible,
            details: scores
        };

        onSubmit(evaluation);
    };

    const handleChange = (criteriaId, val) => {
        setScores(prev => ({ ...prev, [criteriaId]: parseInt(val) }));
    };

    return (
        <div className="card" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1001, width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{initialData ? 'تعديل التقييم' : `تقييم: ${member.name}`}</h2>
            {initialData && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '6px', color: '#c2410c' }}>
                    <strong>ملاحظة:</strong> التقييم السابق: {initialData.score}/{initialData.maxScore}.
                    <br />
                    بما أن التفاصيل لا تُحفظ، يرجى إعادة التقييم بالكامل أو إدخال المجموع مباشرة.
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>تاريخ التقييم</label>
                    <input
                        type="date"
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        value={evaluationDate}
                        onChange={(e) => setEvaluationDate(e.target.value)}
                    />
                </div>

                {/* Allow manual score override if editing */}
                {initialData && (
                    <div style={{ marginBottom: '15px', padding: '10px', border: '1px dashed #ccc', borderRadius: '6px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>تعديل المجموع مباشرة (اختياري)</label>
                        <input
                            type="number"
                            min="0"
                            max="25"
                            placeholder="أدخل المجموع الجديد مباشرة"
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                            onChange={(e) => {
                                // Special handling to bypass criteria if manual score is entered
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                    setScores({ manual: val });
                                }
                            }}
                        />
                        <small style={{ color: '#666' }}>اترك هذا فارغاً إذا كنت تريد استخدام المعايير أدناه. (الحد الأقصى: 25)</small>
                    </div>
                )}

                {CRITERIA.map(crit => (
                    <div key={crit.id} style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{crit.label}</label>
                        <select
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                            onChange={(e) => handleChange(crit.id, e.target.value)}
                            value={scores[crit.id] !== undefined ? scores[crit.id] : ''}
                            // Not required if editing (can use manual score)
                            required={!initialData && scores.manual === undefined}
                        >
                            <option value="">اختر التقييم...</option>
                            {crit.options.map(opt => (
                                <option key={opt.val} value={opt.val}>{opt.label} ({opt.val} نقاط)</option>
                            ))}
                        </select>
                    </div>
                ))}

                <div className="flex" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" className="btn btn-outline" onClick={onCancel}>إلغاء</button>
                    <button type="submit" className="btn btn-primary">حفظ التقييم</button>
                </div>
            </form>
        </div>
    );
};

export default EvaluationForm;
