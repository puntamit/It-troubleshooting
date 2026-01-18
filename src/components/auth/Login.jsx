import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            console.log('Login: Attempting signIn...');
            await signIn(username, password);
            console.log('Login: signIn successful, navigating...');
            navigate('/');
        } catch (err) {
            console.error('Login: handleSubmit error:', err);
            setError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">
                    📚
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">เข้าสู่ระบบ</h2>
                <p className="text-slate-500 dark:text-slate-400">จัดการหน้าคู่มือแก้ไขปัญหาของคุณ</p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อผู้ใช้ (Username)</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="กรอกชื่อผู้ใช้ของคุณ"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">รหัสผ่าน</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                    {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>

                <div className="text-right">
                    <button
                        type="button"
                        onClick={async () => {
                            const emailInput = prompt('กรุณากรอกอีเมลที่ใช้สมัครสมาชิก (username@internal.com):');
                            if (emailInput) {
                                try {
                                    setLoading(true);
                                    const baseUrl = (import.meta.env.VITE_REDIRECT_URL || window.location.origin).replace(/\/$/, '');
                                    await supabase.auth.resetPasswordForEmail(emailInput.toLowerCase(), {
                                        redirectTo: `${baseUrl}/reset-password`,
                                    });
                                    alert('ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาเช็คใน Inbox ของคุณ');
                                } catch (err) {
                                    alert('เกิดข้อผิดพลาด: ' + err.message);
                                } finally {
                                    setLoading(false);
                                }
                            }
                        }}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                        ลืมรหัสผ่าน?
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                ยังไม่มีบัญชี?{' '}
                <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                    สมัครสมาชิกใหม่
                </Link>
            </div>
        </div>
    );
};

export default Login;
