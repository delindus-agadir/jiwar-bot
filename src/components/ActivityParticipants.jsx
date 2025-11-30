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
                        // This is the member who registered (parent or self)
                        const memberDoc = await databases.getDocument(
                            DATABASE_ID,
                            'members',
                            reg.member_id
                        );

                        let dependentDoc = null;
                        if (reg.dependent_id) {
                            try {
                                // Fetch dependent details from MEMBERS collection
                                dependentDoc = await databases.getDocument(
                                    DATABASE_ID,
                                    'members',
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

    return createPortal(
        <div style={{
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
                            margin-bottom: 20px !important;
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
                            <div className="no-print flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                    title="طباعة"
                                >
                                    <Printer size={20} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                            <div className="no-print mb-4 flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <div className="text-sm text-blue-800">
                                    إجمالي المشاركين: <strong>{participants.length}</strong>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSelectAll(true)}
                                        className="text-xs px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-50"
                                    >
                                        تحديد الكل
                                    </button>
                                    <button
                                        onClick={() => handleSelectAll(false)}
                                        className="text-xs px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-50"
                                    >
                                        إلغاء التحديد
                                    </button>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontSize: '0.875rem' }}>الاسم</th>
                                        <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontSize: '0.875rem' }}>الصفة</th>
                                        <th style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>الحضور</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((p) => (
                                        <tr key={p.$id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: '500', color: '#1e293b' }}>
                                                    {p.dependent ? p.dependent.name : p.member.name}
                                                </div>
                                                {p.dependent && (
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        ولي الأمر: {p.member.name}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px', color: '#64748b' }}>
                                                {p.dependent ? (
                                                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">رعية</span>
                                                ) : (
                                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">عضو</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={p.confirmed_by_admin || false}
                                                    onChange={() => handleToggleAttendance(p.$id)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
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
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    color: '#64748b',
                                    cursor: 'pointer'
                                }}
                            >
                                إغلاق
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    opacity: saving ? 0.7 : 1
                                }}
                            >
                                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={18} />}
                                حفظ الحضور
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

export default ActivityParticipants;
