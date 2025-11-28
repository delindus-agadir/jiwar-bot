import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { account, databases, DATABASE_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import { User, Award, Hash, Save } from 'lucide-react';

const TelegramSignup = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [telegramData, setTelegramData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        matricule: '',
    });

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setError('رابط غير صالح');
            setLoading(false);
            return;
        }
        verifyToken(token);
    }, [searchParams]);

    const verifyToken = async (token) => {
        try {
            // Verify token in database (we'll use magic_links collection for signup tokens too)
            // Assuming we store telegram_id and name in the token document or retrieve it
            const response = await databases.listDocuments(
                DATABASE_ID,
                'magic_links',
                [Query.equal('token', token)]
            );

            if (response.documents.length === 0) {
                setError('رابط غير صالح أو منتهي الصلاحية');
                setLoading(false);
                return;
            }

            const tokenDoc = response.documents[0];

            // Check expiry
            if (new Date(tokenDoc.expires_at) < new Date()) {
                setError('انتهت صلاحية الرابط');
                setLoading(false);
                return;
            }

            setTelegramData({
                id: tokenDoc.telegram_id,
                name: tokenDoc.telegram_name, // Pre-filled name from Telegram
                tokenDocId: tokenDoc.$id
            });

            setFormData(prev => ({
                ...prev,
                name: tokenDoc.telegram_name || ''
            }));

            setLoading(false);
        } catch (err) {
            console.error('Token verification error:', err);
            setError('حدث خطأ أثناء التحقق من الرابط');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const telegramId = telegramData.id;
            const email = `telegram_${telegramId}@jiwar.local`;
            const password = ID.unique() + ID.unique(); // Random strong password

            // 1. Create Auth Account
            let userId;
            try {
                const accountRes = await account.create(ID.unique(), email, password, formData.name);
                userId = accountRes.$id;
            } catch (createErr) {
                if (createErr.code === 409) {
                    throw new Error('هذا الحساب موجود بالفعل');
                }
                throw createErr;
            }

            // 2. Create Session
            await account.createEmailPasswordSession(email, password);

            // 3. Create User Document (for roles/approval)
            await databases.createDocument(
                DATABASE_ID,
                'users',
                userId,
                {
                    email: email,
                    role: 'member',
                    approved: false, // Pending approval
                    blocked: false
                }
            );

            // 4. Create Member Document
            await databases.createDocument(
                DATABASE_ID,
                'members',
                ID.unique(),
                {
                    user_id: userId,
                    name: formData.name,
                    grade: formData.grade,
                    matricule: parseInt(formData.matricule),
                    role: 'member', // Default role
                    join_date: new Date().toISOString(),
                    telegram_id: telegramId.toString()
                }
            );

            // 5. Delete token to prevent reuse and save space
            await databases.deleteDocument(
                DATABASE_ID,
                'magic_links',
                telegramData.tokenDocId
            );

            // Redirect to home (which will show PendingApprovalMessage because approved=false)
            window.location.href = '/';

        } catch (err) {
            console.error('Signup error:', err);

            // Rollback: If we created an account but failed later, we should ideally delete it.
            // But we can't delete it without the user's password (which we just generated) or Admin API.
            // So we just have to inform the user.

            if (err.message === 'هذا الحساب موجود بالفعل') {
                setError(
                    <span>
                        هذا الحساب موجود بالفعل ولكن لم يتم العثور على بيانات العضوية.
                        <br /><br />
                        <strong>الحل:</strong> يرجى حذف الحساب من لوحة تحكم Appwrite (Auth & Users) والمحاولة مرة أخرى.
                    </span>
                );
            } else {
                setError(err.message || 'حدث خطأ أثناء التسجيل');
            }
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
                <p className="text-white text-lg font-medium">جاري التحقق من الرابط...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">❌</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => window.location.href = 'https://t.me/jiwar_association_bot'}
                    className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02]"
                >
                    العودة للبوت
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center" dir="rtl">
            <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:shadow-3xl duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-y-12"></div>
                    <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 bg-white rounded-full p-1 shadow-lg relative z-10" />
                    <h2 className="text-3xl font-bold text-white relative z-10">إكمال التسجيل</h2>
                    <p className="mt-2 text-blue-100 relative z-10">يرجى إكمال معلوماتك للانضمام إلى الجمعية</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                                <User className="w-4 h-4 inline ml-2" />
                                الاسم الكامل
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                                placeholder="الاسم كما يظهر في بطاقة الهوية"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                                <Hash className="w-4 h-4 inline ml-2" />
                                رقم العضوية (Matricule)
                            </label>
                            <input
                                type="number"
                                name="matricule"
                                value={formData.matricule}
                                onChange={handleChange}
                                required
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                                placeholder="رقم عضويتك في الجمعية"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-4 group-focus-within:text-blue-600 transition-colors">
                                <Award className="w-4 h-4 inline ml-2" />
                                اختر الدرجة
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[0, 1, 2, 3, 4, 5].map((grade) => (
                                    <button
                                        key={grade}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, grade: grade.toString() })}
                                        className={`
                                            relative p-4 rounded-xl border-2 text-center transition-all duration-200
                                            ${formData.grade === grade.toString()
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md transform scale-[1.02]'
                                                : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div className="text-lg font-bold mb-1">الدرجة {grade}</div>
                                        <div className="text-xs opacity-75">
                                            {grade === 0 && 'عضو جديد'}
                                            {grade === 1 && 'الأنشطة المفتوحة'}
                                            {grade === 2 && 'المنخرطون'}
                                            {grade === 3 && 'أعضاء اللجان'}
                                            {grade === 4 && 'رؤساء اللجان ونوابهم'}
                                            {grade === 5 && 'المكتب المسير'}
                                        </div>
                                        {formData.grade === grade.toString() && (
                                            <div className="absolute top-2 left-2 text-blue-600">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex justify-center items-center gap-3 py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>جاري التسجيل...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>تأكيد التسجيل</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-500">
                    جمعية الجوار © {new Date().getFullYear()}
                </div>
            </div>
        </div>
    );
};

export default TelegramSignup;
