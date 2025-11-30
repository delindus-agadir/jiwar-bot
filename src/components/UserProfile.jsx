import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateMemberInDb } from '../utils/db';
import { User, Save, X, Calendar, Hash, Award, Users } from 'lucide-react';
import DependentsList from './DependentsList';

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

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">المعلومات الشخصية</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                تعديل
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4 max-w-lg mx-auto">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                                    الاسم الكامل
                                </label>
                                <div className="relative">
                                    <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full pr-10 pl-4 py-2 border rounded-lg text-center ${isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none'
                                            : 'bg-gray-50 border-transparent cursor-default text-gray-600'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Matricule Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                                    رقم العضوية (Matricule)
                                </label>
                                <div className="relative">
                                    <Hash className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="matricule"
                                        value={formData.matricule}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full pr-10 pl-4 py-2 border rounded-lg text-center ${isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none'
                                            : 'bg-gray-50 border-transparent cursor-default text-gray-600'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Grade Field (Read Only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                                    الدرجة الكشفية
                                </label>
                                <div className="relative">
                                    <Award className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.grade}
                                        disabled
                                        className="w-full pr-10 pl-4 py-2 bg-gray-100 border border-transparent rounded-lg text-gray-500 cursor-not-allowed text-center"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 text-center">لا يمكن تعديل الدرجة يدوياً</p>
                            </div>

                            {/* Join Date (Read Only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                                    تاريخ الانضمام
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={currentMember.join_date ? new Date(currentMember.join_date).toLocaleDateString('ar-EG') : '-'}
                                        disabled
                                        className="w-full pr-10 pl-4 py-2 bg-gray-100 border border-transparent rounded-lg text-gray-500 cursor-not-allowed text-center"
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-center gap-4 pt-6 border-t mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-8 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {loading ? 'جاري الحفظ...' : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            حفظ التغييرات
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {activeTab === 'dependents' && (
                <DependentsList />
            )}
        </div>
    );
};

export default UserProfile;
