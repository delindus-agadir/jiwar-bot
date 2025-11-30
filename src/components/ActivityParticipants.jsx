import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getActivityRegistrations, updateRegistrationStatus } from '../utils/db';
import { databases, DATABASE_ID } from '../lib/appwrite';
import { X, Save, Printer, Send } from 'lucide-react';

const ActivityParticipants = ({ activityId, activityTitle, activityLocation, activityDate, activityTime, currentMember, onClose }) => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchParticipants();
    }, [activityId]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const registrations = await getActivityRegistrations(activityId);

            // Fetch member details for each registration
            const participantsData = await Promise.all(
                registrations.map(async (reg) => {
                    try {
                        const memberDoc = await databases.getDocument(
                            DATABASE_ID,
                            'members',
                            reg.member_id
                        );

                        let dependentDoc = null;
                        if (reg.dependent_id) {
                            try {
                                dependentDoc = await databases.getDocument(
                                    DATABASE_ID,
                                    'dependents',
                                    reg.dependent_id
                                );
                            } catch (e) {
                                console.error(`Error fetching dependent ${reg.dependent_id}:`, e);
                            }
                        }

                        return {
                            ...reg,
                            member: memberDoc,
                            dependent: dependentDoc
                        };
                    } catch (error) {
                        console.error(`Error fetching member ${reg.member_id}:`, error);
                        return { ...reg, member: { name: 'Unknown Member' } };
                    }
                })
            );

            setParticipants(participantsData);
        } catch (error) {
            console.error('Error fetching participants:', error);
            alert('فشل تحميل قائمة المشاركين');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAttendance = (registrationId) => {
        setParticipants(prev => prev.map(p => {
            if (p.$id === registrationId) {
                return { ...p, confirmed_by_admin: !p.confirmed_by_admin };
            }
            return p;
        }));
    };

    const handleSelectAll = (select) => {
        setParticipants(prev => prev.map(p => ({
            ...p,
            confirmed_by_admin: select
        })));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await Promise.all(
                participants.map(p =>
                    updateRegistrationStatus(p.$id, p.confirmed_by_admin)
                )
            );
            alert('تم حفظ التغييرات بنجاح');
            onClose();
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('فشل حفظ التغييرات');
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSendToTelegram = async () => {
        if (!currentMember?.telegram_id) {
            alert('لم يتم العثور على حساب تيليجرام مرتبط بحسابك');
            return;
        }

        try {
            const participantsList = participants.map(p => ({
                name: p.member?.name,
                matricule: p.member?.matricule || p.member?.Matricule,
                grade: p.member?.grade,
                confirmed: p.confirmed_by_admin
            }));

            const response = await fetch('/.netlify/functions/send-participants-list', {
                method: 'POST',
                body: JSON.stringify({
                    telegramId: currentMember.telegram_id,
                    activityTitle,
                    location: activityLocation,
                    eventDate: activityDate,
                    eventTime: activityTime,
                    participants: participantsList
                })
            });

            if (response.ok) {
                alert('تم إرسال القائمة إلى حسابك في تيليجرام بنجاح');
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            alert('فشل إرسال القائمة');
        }
    };

    const modalContent = (
        <div className="print-portal-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <style>
                {`
                    @media print {
                        /* Hide everything in the body except the portal */
                        body > *:not(.print-portal-container) {
                            display: none !important;
                        }

                        /* Ensure body and html allow full height for print */
                        html, body {
                            height: auto !important;
                            overflow: visible !important;
                            background: white !important;
                        }
                        
                        /* Show the print content */
                        .print-modal-content {
                            display: block !important;
                            position: static !important;
                            width: 100% !important;
                            height: auto !important;
                            box-shadow: none !important;
                            border: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: visible !important;
                        }

                        .print-modal-content * {
                            visibility: visible !important;
                        }

                        /* Hide buttons and close icon */
                        .no-print {
                            display: none !important;
                        }

                        .print-only {
                            display: block !important;
                        }

                        /* Style table for print */
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        
                        th, td {
                            border: 1px solid #000;
                            padding: 8px;
                            color: #000 !important;
                            text-align: right;
                        }
                        
                        th {
                            background-color: #f0f0f0 !important;
                            font-weight: bold;
                        }

                        @page {
                            margin: 1cm;
                            size: auto;
                        }
                    }
                `}
            </style>
            <div className="print-modal-content" style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
                        جاري تحميل المشاركين...
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                                المشاركون في: {activityTitle}
                            </h2>
                            <div className="print-only" style={{ display: 'none', marginTop: '10px', fontSize: '1rem', color: '#333' }}>
                                <div>المكان: {activityLocation || 'غير محدد'}</div>
                                <div>التاريخ: {activityDate ? new Date(activityDate).toLocaleDateString('fr-FR') : 'غير محدد'} - {activityTime || 'غير محدد'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handlePrint}
                                    className="btn btn-outline no-print"
                                    title="طباعة القائمة"
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                    <Printer size={20} />
                                    طباعة
                                </button>
                                <button
                                    onClick={handleSendToTelegram}
                                    className="btn btn-outline no-print"
                                    title="إرسال إلى تيليجرام"
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                    <Send size={20} />
                                    تيليجرام
                                </button>
                                <button
                                    onClick={onClose}
                                    className="no-print"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <X size={24} color="#64748b" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                            <div className="no-print" style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleSelectAll(true)}
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.9rem' }}
                                >
                                    تحديد الكل
                                </button>
                                <button
                                    onClick={() => handleSelectAll(false)}
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.9rem' }}
                                >
                                    إلغاء تحديد الكل
                                </button>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>
                                        <th style={{ padding: '12px' }}>الاسم</th>
                                        <th style={{ padding: '12px' }}>رقم العضوية</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>الحضور</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map(p => (
                                        <tr key={p.$id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px' }}>
                                                {p.dependent ? (
                                                    <div>
                                                        <div style={{ fontWeight: 'bold' }}>{p.dependent.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>تابع لـ: {p.member?.name}</div>
                                                    </div>
                                                ) : (
                                                    p.member?.name
                                                )}
                                            </td>
                                            <td style={{ padding: '12px' }}>{p.member?.matricule || p.member?.Matricule || '-'}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={p.confirmed_by_admin || false}
                                                    onChange={() => handleToggleAttendance(p.$id)}
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {participants.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                                لا يوجد مشاركون مسجلون في هذا النشاط
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="no-print" style={{
                            padding: '20px',
                            borderTop: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px'
                        }}>
                            <button
                                onClick={onClose}
                                className="btn btn-outline"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn btn-primary"
                                disabled={saving}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {saving ? 'جاري الحفظ...' : (
                                    <>
                                        <Save size={18} />
                                        حفظ التغييرات
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ActivityParticipants;
