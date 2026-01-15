import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, User, Lock, Mail, Shield } from 'lucide-react';

const UserForm = ({ user, onSave, onCancel }) => {
    const isEditing = !!user;
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState(user?.display_name || user?.user_metadata?.display_name || '');
    const [role, setRole] = useState(user?.role || 'user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            // For editing, we might be passed a profile object which has display_name and role directly
            setDisplayName(user.display_name || '');
            setRole(user.role || 'user');
        }
    }, [user, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!displayName.trim()) {
            return setError('กรุณากรอกชื่อที่ใช้แสดง');
        }

        if (!isEditing) {
            if (!email.trim() || !password.trim()) {
                return setError('กรุณากรอกอีเมลและรหัสผ่าน');
            }
            if (password.length < 6) {
                return setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            }
        }

        setLoading(true);
        try {
            const userData = {
                id: user?.id,
                email,
                password,
                display_name: displayName,
                role
            };
            await onSave(userData);
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border dark:border-slate-800">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">
                            {isEditing ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่'}
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form id="user-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {!isEditing && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">อีเมล</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">รหัสผ่าน</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                        placeholder="อย่างน้อย 6 ตัวอักษร"
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ชื่อที่ใช้แสดง</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                placeholder="ชื่อ-นามสกุล หรือ ชื่อเล่น"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">บทบาท (Role)</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none font-medium"
                            >
                                <option value="user">User (ผู้ใช้งานทั่วไป)</option>
                                <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                            </select>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all text-sm"
                    >
                        ยกเลิก
                    </button>
                    <button
                        form="user-form"
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 text-sm"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <Save size={16} />
                        )}
                        {isEditing ? 'บันทึก' : 'เพิ่มผู้ใช้'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserForm;
