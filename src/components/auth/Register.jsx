import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('รหัสผ่านไม่ตรงกัน');
        }

        if (password.length < 6) {
            return setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }

        setLoading(true);
        try {
            await signUp(username, password);
            alert('สมัครสมาชิกสำเร็จ! ตอนนี้คุณสามารถเข้าสู่ระบบด้วยชื่อผู้ใช้นี้ได้เลย');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">
                    📚
                </div>
                <h2 className="text-2xl font-bold text-slate-800">สมัครสมาชิก</h2>
                <p className="text-slate-500">เริ่มสร้างคู่มือแก้ไขปัญหาของคุณ</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="เลือกชื่อผู้ใช้ของคุณ"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">ยืนยันรหัสผ่าน</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                    {loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600">
                มีบัญชีอยู่แล้ว?{' '}
                <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                    เข้าสู่ระบบ
                </Link>
            </div>
        </div>
    );
};

export default Register;
