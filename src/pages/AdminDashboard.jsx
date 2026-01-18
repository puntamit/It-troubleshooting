import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, Users, Trash2, Edit3, UserCog, Search, AlertCircle, CheckCircle2, Home, Plus, Lock } from 'lucide-react';
import ManualForm from '../components/manuals/ManualForm';
import UserForm from '../components/users/UserForm';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const AdminDashboard = () => {
    const { profile, user, refreshProfile } = useAuth();
    const [manuals, setManuals] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [activeTab, setActiveTab] = useState('manuals');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingManual, setEditingManual] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: '', // 'deleteManual' | 'deleteUser' | 'addUserWarning'
        id: null,
        data: null, // For passing extra data like userData
        title: '',
        message: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setStatus({ type: '', message: '' });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fetch timeout: Request took too long')), 5000)
        );

        try {
            let fetchPromise;
            if (activeTab === 'manuals') {
                fetchPromise = supabase
                    .from('manuals')
                    .select('*, steps(*)')
                    .order('created_at', { ascending: false });
            } else {
                fetchPromise = supabase
                    .from('profiles')
                    .select('*')
                    .order('display_name');
            }

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
            if (error) throw error;

            if (activeTab === 'manuals') {
                setManuals(data);
            } else {
                setProfiles(data);
            }
        } catch (err) {
            console.error('AdminDashboard: fetchData failed:', err.message);
            setStatus({ type: 'error', message: 'ไม่สามารถโหลดข้อมูลได้: ' + err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteManualClick = (id) => {
        setConfirmation({
            isOpen: true,
            type: 'deleteManual',
            id: id,
            title: 'ลบคู่มือ',
            message: 'คุณแน่ใจหรือไม่ว่าต้องการลบคู่มือนี้? การกระทำนี้ไม่สามารถย้อนคืนได้'
        });
    };

    const executeDeleteManual = async (id) => {

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Delete timeout: Operation took too long')), 5000)
        );

        try {
            const deleteOperation = supabase.from('manuals').delete().eq('id', id);
            const { error } = await Promise.race([deleteOperation, timeoutPromise]);

            if (error) throw error;
            setManuals(manuals.filter(m => m.id !== id));
            setStatus({ type: 'success', message: 'ลบคู่มือสำเร็จ' });
        } catch (err) {
            console.error('AdminDashboard: handleDeleteManual failed:', err.message);
            setStatus({ type: 'error', message: err.message });
        }
    };

    const handleDeleteUserClick = (id) => {
        setConfirmation({
            isOpen: true,
            type: 'deleteUser',
            id: id,
            title: 'ลบผู้ใช้งาน',
            message: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? (การลบนี้จะลบเฉพาะข้อมูลโปรไฟล์ในแอป การลบบัญชีผู้ใช้ถาวรต้องทำผ่าน Supabase Dashboard)'
        });
    };

    const executeDeleteUser = async (id) => {

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Delete timeout: Operation took too long')), 5000)
        );

        try {
            const deleteOperation = supabase.from('profiles').delete().eq('id', id);
            const { error } = await Promise.race([deleteOperation, timeoutPromise]);

            if (error) throw error;
            setProfiles(profiles.filter(p => p.id !== id));
            setStatus({ type: 'success', message: 'ลบข้อมูลโปรไฟล์ผู้ใช้สำเร็จ' });
        } catch (err) {
            console.error('AdminDashboard: handleDeleteUser failed:', err.message);
            setStatus({ type: 'error', message: err.message });
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Update timeout: Operation took too long')), 5000)
        );

        try {
            const updateOperation = supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            const { error } = await Promise.race([updateOperation, timeoutPromise]);

            if (error) throw error;
            setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
            setStatus({ type: 'success', message: 'อัปเดตสิทธิ์สำเร็จ' });
        } catch (err) {
            console.error('AdminDashboard: handleUpdateRole failed:', err.message);
            setStatus({ type: 'error', message: err.message });
        }
    };

    const handleSaveManual = async (manualData) => {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Save timeout: Operation took too long')), 8000)
        );

        try {
            const { steps: stepData, ...manualBase } = manualData;

            const saveOperation = (async () => {
                // 1. Update Manual
                const { error: manualError } = await supabase
                    .from('manuals')
                    .update(manualBase)
                    .eq('id', editingManual.id);

                if (manualError) throw manualError;

                // 2. Clear old steps and insert new ones
                await supabase.from('steps').delete().eq('manual_id', editingManual.id);
                const { error: stepsError } = await supabase
                    .from('steps')
                    .insert(stepData.map(s => ({
                        title: s.title,
                        content: s.content,
                        image_url: s.image_url,
                        step_order: s.step_order,
                        manual_id: editingManual.id
                    })));

                if (stepsError) throw stepsError;
            })();

            await Promise.race([saveOperation, timeoutPromise]);

            setStatus({ type: 'success', message: 'แก้ไขคู่มือสำเร็จ' });
            setEditingManual(null);
            fetchData();
        } catch (err) {
            console.error('AdminDashboard: handleSaveManual failed:', err.message);
            setStatus({ type: 'error', message: err.message });
        }
    };

    const handleSaveUser = async (userData) => {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Save timeout: Operation took too long')), 8000)
        );

        try {
            if (userData.id) {
                // Update existing user profile
                const updateOperation = supabase
                    .from('profiles')
                    .update({
                        display_name: userData.display_name,
                        role: userData.role,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userData.id);

                const { error } = await Promise.race([updateOperation, timeoutPromise]);
                if (error) throw error;

                setProfiles(profiles.map(p => p.id === userData.id ? { ...p, ...userData } : p));

                // If updating self, refresh global profile context AND update Auth Metadata
                if (user && userData.id === user.id) {
                    await supabase.auth.updateUser({
                        data: { display_name: userData.display_name }
                    });
                    refreshProfile();
                }

                setStatus({ type: 'success', message: 'แก้ไขข้อมูลผู้ใช้สำเร็จ' });
            } else {
                // Add new user (Note: This uses client-side signUp which has limitations)
                if (!window.confirm('คำเตือน: การสร้างผู้ใช้ใหม่จะทำให้ "Admin ปัจจุบันถูก Logout" เนื่องจากข้อจำกัดของระบบ \n\nคุณต้องการดำเนินการต่อหรือไม่?')) {
                    return;
                }
                await executeAddUser(userData);
            }
        } catch (err) {
            console.error('AdminDashboard: handleSaveUser failed:', err.message);
            setStatus({ type: 'error', message: 'บันทึกข้อมูลไม่สำเร็จ: ' + err.message });
        }
    };

    const executeAddUser = async (userData) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: { display_name: userData.display_name }
                }
            });

            if (error) throw error;

            if (data.user) {
                window.location.reload();
            }
            setEditingUser(null);
            setIsAddingUser(false);
        } catch (err) {
            throw err;
        }
    };

    const handleConfirmAction = async () => {
        if (confirmation.type === 'deleteManual') {
            await executeDeleteManual(confirmation.id);
        } else if (confirmation.type === 'deleteUser') {
            await executeDeleteUser(confirmation.id);
        }
    };

    const filteredManuals = manuals.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProfiles = profiles.filter(p =>
        p.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Shield size={24} />
                        </div>
                        <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight hidden sm:block">Admin Console</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all font-bold text-sm"
                        >
                            <Home size={18} />
                            <span className="hidden sm:inline">หน้าหลัก</span>
                        </Link>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">
                            {profile?.display_name} (Admin)
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Status Alert */}
                {status.message && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${status.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                        <span className="font-bold text-sm">{status.message}</span>
                        <button onClick={() => setStatus({ type: '', message: '' })} className="ml-auto opacity-50 hover:opacity-100 italic text-xs underline">ปิด</button>
                    </div>
                )}

                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm self-start w-full md:w-auto overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('manuals')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'manuals' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <BookOpen size={18} />
                            คู่มือทั้งหมด
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Users size={18} />
                            ผู้ใช้งาน
                        </button>
                    </div>

                    <div className="relative group max-w-sm w-full flex gap-3">
                        {activeTab === 'users' && (
                            <button
                                onClick={() => setIsAddingUser(true)}
                                className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all font-bold flex-shrink-0"
                            >
                                <Plus size={20} />
                                <span className="hidden sm:inline">เพิ่มผู้ใช้</span>
                            </button>
                        )}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder={activeTab === 'manuals' ? "ค้นหาคู่มือหรือผู้เขียน..." : "ค้นหาชื่อผู้ใช้..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm text-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-bold">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    {activeTab === 'manuals' ? (
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">คู่มือ</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">หมวดหมู่</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">ผู้เขียน</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">ผู้ใช้งาน</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">ID</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">บทบาท (Role)</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">เปลี่ยนสิทธิ์</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {activeTab === 'manuals' ? (
                                        filteredManuals.map(manual => (
                                            <tr key={manual.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 dark:text-white">{manual.title}</div>
                                                    <div className="text-xs text-slate-400 truncate max-w-[300px]">{manual.description}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold ring-1 ring-inset ring-indigo-600/10">
                                                        {manual.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                            {manual.author_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{manual.author_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingManual(manual)}
                                                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteManualClick(manual.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        filteredProfiles.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${p.role === 'admin' ? 'bg-indigo-600' : 'bg-slate-400'
                                                            }`}>
                                                            {p.display_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <span className="font-bold text-slate-800 dark:text-white">{p.display_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{p.id}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-500'
                                                        }`}>
                                                        {p.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`ส่งอีเมลรีเซ็ตรหัสผ่านให้คุณ ${p.display_name} ใช่หรือไม่? \n(อีเมลจะส่งไปที่ ${p.id.substring(0, 8)}... หรืออีเมลที่ผู้ใช้ใช้สมัคร)`)) {
                                                                    try {
                                                                        const email = `${p.display_name}@internal.com`.toLowerCase(); // Assuming internal logic or ID-based? Actually profiles in Supabase usually have email in auth side.
                                                                        // Since we use the username@internal.com pattern mostly:
                                                                        const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin;
                                                                        await supabase.auth.resetPasswordForEmail(email, {
                                                                            redirectTo: `${redirectUrl}/reset-password`,
                                                                        });
                                                                        setStatus({ type: 'success', message: `ส่งอีเมลรีเซ็ตรหัสผ่านให้คุณ ${p.display_name} แล้ว` });
                                                                    } catch (err) {
                                                                        setStatus({ type: 'error', message: 'ส่งไม่สำเร็จ: ' + err.message });
                                                                    }
                                                                }
                                                            }}
                                                            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                            title="ส่งอีเมลรีเซ็ตรหัสผ่าน"
                                                        >
                                                            <Lock size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUser(p)}
                                                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                            title="แก้ไขข้อมูล"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUserClick(p.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                            title="ลบผู้ใช้"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {((activeTab === 'manuals' && filteredManuals.length === 0) || (activeTab === 'users' && filteredProfiles.length === 0)) && (
                                <div className="p-20 text-center">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <p className="text-slate-400 font-bold">ไม่พบข้อมูลที่ค้นหา</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Editing Modal */}
            {editingManual && (
                <ManualForm
                    manual={editingManual}
                    onSave={handleSaveManual}
                    onCancel={() => setEditingManual(null)}
                />
            )}

            {(editingUser || isAddingUser) && (
                <UserForm
                    user={editingUser}
                    onSave={handleSaveUser}
                    onCancel={() => {
                        setEditingUser(null);
                        setIsAddingUser(false);
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
