import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateMemberInDb } from '../utils/db';
import { User, Save, X, Calendar, Hash, Award, Users } from 'lucide-react';
import DependentsManagement from './DependentsManagement';

const UserProfile = () => {
    const { currentMember, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'dependents'
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        matricule: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (currentMember) {
            setFormData({
                name: currentMember.name || '',
                grade: currentMember.grade || '',
                matricule: currentMember.matricule || currentMember.Matricule || '',
            });
        }
    }, [currentMember]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Update member information in database
            await updateMemberInDb(currentMember.$id, {
                name: formData.name,
                role: currentMember.role, // Keep existing role unchanged
                grade: formData.grade,
                matricule: parseInt(formData.matricule),
                joinDate: currentMember.join_date, // Keep existing join date
            });

            setMessage({ type: 'success', text: 'تم تحديث المعلومات بنجاح' });
            setIsEditing(false);

            // Reload page to refresh context
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'حدث خطأ أثناء التحديث: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!currentMember) {
        return <div className="p-4">جاري تحميل البيانات...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <User className="w-8 h-8 text-blue-600" />
                    الملف الشخصي
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors relative ${activeTab === 'profile'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        المعلومات الشخصية
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('dependents')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors relative ${activeTab === 'dependents'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        الرعايا والأبناء
                    </div>
                </button>
            </div>

            {activeTab === 'profile' ? (
                <div className="grid grid-cols-1 gap-6 animate-fade-in">
                    {message && (
                        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end mb-4">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-primary"
                            >
                                تعديل المعلومات
                            </button>
                        )}
                    </div>

                    {/* Main Info Card */}
                    <div className="card bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    ) : (
                                        <div className="text-lg font-medium text-slate-900">{currentMember.name}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                                    <div className="text-lg text-slate-600" dir="ltr" style={{ textAlign: 'right' }}>{currentUser?.email}</div>
                                    <p className="text-xs text-slate-400 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Hash className="w-4 h-4 inline mr-1" />
                                        رقم العضوية (Matricule)
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="matricule"
                                            value={formData.matricule}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    ) : (
                                        <div className="text-lg font-mono font-bold text-slate-900">{currentMember.matricule || currentMember.Matricule || '-'}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Award className="w-4 h-4 inline mr-1" />
                                        الدرجة
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="grade"
                                            value={formData.grade}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    ) : (
                                        <div className="text-lg font-bold text-slate-900">الدرجة {currentMember.grade}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        تاريخ الانضمام
                                    </label>
                                    <div className="text-lg font-bold text-slate-900">
                                        {new Date(currentMember.join_date).toLocaleDateString('en-GB')}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">لا يمكن تغيير تاريخ الانضمام</p>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 pt-6 mt-6 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                name: currentMember.name || '',
                                                grade: currentMember.grade || '',
                                                matricule: currentMember.matricule || currentMember.Matricule || '',
                                            });
                                        }}
                                        className="btn btn-outline flex items-center gap-2"
                                    >
                                        <X size={18} />
                                        إلغاء
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <DependentsManagement />
                </div>
            )}
        </div>
    );
};

export default UserProfile;
