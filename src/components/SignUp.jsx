import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('viewer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, loginWithGoogle, currentUser, hasMembership } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            if (hasMembership) {
                navigate('/dashboard');
            } else {
                navigate('/complete-registration');
            }
        }
    }, [currentUser, hasMembership, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password
        if (password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, 'viewer');
        } catch (err) {
            console.error("Signup Error Details:", err);
            setError('فشل إنشاء الحساب: ' + (err.message || err));
        }
        setLoading(false);
    };

    const handleGoogleSignup = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
        } catch (err) {
            setError('فشل التسجيل عبر جوجل: ' + err.message);
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>إنشاء حساب جديد</h2>
                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>البريد الإلكتروني</label>
                        <input
                            type="email"
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>كلمة المرور</label>
                        <input
                            type="password"
                            required
                            minLength="8"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                            يجب أن تكون 8 أحرف على الأقل
                        </small>
                    </div>


                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px', marginBottom: '10px' }}
                        disabled={loading}
                    >
                        {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
                    </button>

                    <button
                        type="button"
                        onClick={handleGoogleSignup}
                        className="btn"
                        style={{ width: '100%', padding: '12px', background: '#fff', color: '#333', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        disabled={loading}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px' }} />
                        التسجيل باستخدام Google
                    </button>
                </form>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/login">لديك حساب بالفعل؟ تسجيل الدخول</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
