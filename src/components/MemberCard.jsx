import React from 'react';
import { calculateEffectiveness, getClassification } from '../utils/calculations';

const MemberCard = ({ member, onEvaluate }) => {
    const evaluations = member.evaluations || [];
    const rate = calculateEffectiveness(evaluations);
    const classification = getClassification(rate);

    return (
        <div className="card">
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3>{member.name}</h3>
                <span className="badge" style={{ backgroundColor: classification.color }}>
                    {classification.label}
                </span>
            </div>

            <div style={{ color: 'var(--text-light)', marginBottom: '15px' }}>
                <div>الدرجة: {member.grade} - {member.role}</div>
                <div>تاريخ الانضمام: {member.join_date || member.joinDate}</div>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {rate}%
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>معدل الفعالية</div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onEvaluate(member)}>
                إضافة تقييم
            </button>
        </div>
    );
};

export default MemberCard;
