import React, { useState, useEffect } from 'react';
import { createDependent, listDependentsByParent, updateDependent, deleteDependent, RELATIONSHIPS, validateDependent, generateDependentEmail } from '../lib/dependents';
import { account } from '../lib/appwrite';
import { User, Heart, Plus, Trash2, Edit2, X, Save, Loader, AlertCircle, Check, Mail } from 'lucide-react';

const DependentsList = () => {
    const [user, setUser] = useState(null);
    const [myDependents, setMyDependents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        matricule: '',
        relationship: RELATIONSHIPS.SON,
        grade: '1'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            const data = await listDependentsByParent(currentUser.$id);
            setMyDependents(data.documents);
        } catch (err) {
            console.error('Error loading dependents:', err);
            setError('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            matricule: '',
            relationship: RELATIONSHIPS.SON,
            grade: '1'
        });
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (dependent) => {
        setFormData({
            name: dependent.name,
            matricule: dependent.matricule || '',
            relationship: dependent.role,
            grade: dependent.grade || '1'
        });
        setEditingId(dependent.$id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الرعية؟')) return;

        try {
            await deleteDependent(id);
            setMyDependents(prev => prev.filter(d => d.$id !== id));
        } catch (err) {
            console.error('Error deleting dependent:', err);
            setError('فشل حذف الرعية');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const validation = validateDependent(formData);
        if (!validation.isValid) {
            setError(Object.values(validation.errors)[0]);
            setSubmitting(false);
            return;
        }

        try {
            if (editingId) {
                const updated = await updateDependent(editingId, formData);
                setMyDependents(prev => prev.map(d => d.$id === editingId ? updated : d));
            } else {
                const created = await createDependent(user.$id, formData);
                setMyDependents(prev => [created, ...prev]);
            }
            resetForm();
        } catch (err) {
            console.error('Error saving dependent:', err);
            setError(err.message || 'حدث خطأ أثناء الحفظ');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate what the email would be for the next dependent
    const nextDependentEmail = user ? generateDependentEmail(user.email, myDependents.length + 1) : '';

    if (loading) return (
        <div className="flex justify-center items-center p-8">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-red-500" />
                    رعاياي (الأبناء والأقارب) <span className="text-xs text-gray-400 font-normal mr-2">v2.0</span>
                </h2>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة رعية
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {showForm && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-700">
                            {editingId ? 'تعديل بيانات الرعية' : 'إضافة رعية جديد'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4 max-w-md mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الاسم الكامل
                                </label>
                                <div className="relative">
                                    <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="الاسم الكامل"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رقم العضوية (Matricule)
                                </label>
                                <input
                                    type="number"
                                    name="matricule"
                                    value={formData.matricule}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="رقم العضوية"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    صلة القرابة
                                </label>
                                <select
                                    name="relationship"
                                    value={formData.relationship}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {Object.values(RELATIONSHIPS).map(rel => (
                                        <option key={rel} value={rel}>{rel}</option>
                                    ))}
                                </select>
                            </div>

                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        البريد الإلكتروني (تلقائي)
                                    </label>
                                    <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600" dir="ltr" style={{ textAlign: 'right' }}>
                                        {nextDependentEmail}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">سيتم إنشاء هذا البريد تلقائياً</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                حفظ
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myDependents.map(dependent => (
                    <div key={dependent.$id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group">
                        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(dependent)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                title="تعديل"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(dependent.$id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                title="حذف"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{dependent.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{dependent.role}</p>

                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        #{dependent.matricule || 'غير محدد'}
                                    </span>

                                    {dependent.approved ? (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            معتمد
                                        </span>
                                    ) : (
                                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Loader className="w-3 h-3" />
                                            قيد المراجعة
                                        </span>
                                    )}
                                </div>

                                {dependent.dependent_email && (
                                    <p className="text-xs text-gray-400 mt-2" dir="ltr" style={{ textAlign: 'right' }}>
                                        {dependent.dependent_email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {myDependents.length === 0 && !showForm && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">لا يوجد رعايا مسجلين حالياً</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            إضافة أول رعية
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DependentsList;
