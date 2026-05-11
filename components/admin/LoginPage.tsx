
import React, { useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface LoginPageProps {
    onLogin: (success: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Fallback for demo/dev if needed, but primary is real auth
        if (email === 'admin' && password === 'admin123') {
            onLogin(true);
            setIsLoading(false);
            return;
        }

        try {
            await StorageService.login(email, password);
            onLogin(true);
        } catch (err: any) {
            console.error("Login failed", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            } else if (err.code === 'auth/too-many-requests') {
                setError('محاولات كثيرة خاطئة. يرجى الانتظار قليلاً.');
            } else {
                setError('حدث خطأ في تسجيل الدخول: ' + err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">تسجيل الدخول</h1>
                    <p className="text-gray-400">لوحة تحكم الموقع الرسمي</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm font-bold">البريد الإلكتروني</label>
                        <div className="relative">
                            <Mail className="absolute right-3 top-3 text-gray-500" size={20} />
                            <input 
                                type="text" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 px-10 text-white focus:outline-none focus:border-gold-500 transition-colors"
                                placeholder="name@example.com"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2 text-sm font-bold">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-3 text-gray-500" size={20} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 px-10 text-white focus:outline-none focus:border-gold-500 transition-colors"
                                placeholder="••••••••"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm flex items-center gap-2 bg-red-900/20 p-3 rounded border border-red-900/50">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold py-3 rounded-lg transition-colors shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading && <Loader2 className="animate-spin" size={20} />}
                        {isLoading ? 'جاري التحقق...' : 'دخول'}
                    </button>
                    
                    <div className="text-center text-xs text-gray-500 mt-4">
                        تأكد من تفعيل Email/Password في Firebase Console
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
