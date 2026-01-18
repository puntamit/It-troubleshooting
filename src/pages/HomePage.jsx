import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Search, BookOpen, LogOut, Loader2, Moon, Sun, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ManualCard from '../components/manuals/ManualCard';
import ManualForm from '../components/manuals/ManualForm';
import ManualDetail from '../components/manuals/ManualDetail';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const HomePage = () => {
    const { signOut, user, profile } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [manuals, setManuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const [viewingManual, setViewingManual] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedManual, setSelectedManual] = useState(null);
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: '', // 'logout' | 'delete'
        id: null,
        title: '',
        message: ''
    });

    useEffect(() => {
        fetchManuals();
    }, []);

    const fetchManuals = async () => {
        setLoading(true);
        setFetchError(null);
        console.log('HomePage: fetchManuals started');

        const timeoutMs = 7000;
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Fetch timeout: Request took longer than ${timeoutMs}ms`)), timeoutMs)
        );

        try {
            console.log('HomePage: Executing manual fetch (with timeout)...');

            // Explicitly convert to Promise to ensure .then() is called correctly in race
            const fetchPromise = (async () => {
                const result = await supabase
                    .from('manuals')
                    .select(`
                        *,
                        steps (*)
                    `)
                    .order('created_at', { ascending: false });
                return result;
            })();

            const result = await Promise.race([fetchPromise, timeoutPromise]);
            const { data, error } = result;

            if (error) {
                console.error('HomePage: Supabase error:', error);
                throw error;
            }

            console.log('HomePage: Manuals received items:', data?.length || 0);
            setManuals(data || []);
        } catch (error) {
            console.warn('HomePage: fetchManuals handled error:', error.message);
            setFetchError(error.message);

            // Attempt fallback if it looks like a network hang or complex query issue
            if (error.message.includes('timeout') || error.message.includes('fetch')) {
                console.log('HomePage: Attempting simplified fallback query...');
                try {
                    const { data: simpleData, error: simpleError } = await supabase
                        .from('manuals')
                        .select('*')
                        .limit(5);

                    if (!simpleError && simpleData) {
                        console.log('HomePage: Fallback successful (partial data loaded)');
                        setManuals(simpleData);
                        setFetchError(null); // Clear error since we have some data
                    }
                } catch (fallbackErr) {
                    console.error('HomePage: Fallback fetch also failed');
                }
            }
        } finally {
            console.log('HomePage: fetchManuals cycle complete');
            setLoading(false);
        }
    };

    const handleSaveManual = async (manualData) => {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Save timeout: Operation took too long')), 8000)
        );

        try {
            const isEditing = !!selectedManual;

            const saveOperation = (async () => {
                if (isEditing) {
                    // 1. Update Manual
                    const { error: manualError } = await supabase
                        .from('manuals')
                        .update({
                            title: manualData.title,
                            category: manualData.category,
                            description: manualData.description,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', selectedManual.id);

                    if (manualError) throw manualError;

                    // 2. Refresh steps
                    await supabase.from('steps').delete().eq('manual_id', selectedManual.id);
                    const { error: stepsError } = await supabase
                        .from('steps')
                        .insert(manualData.steps.map(s => ({
                            title: s.title,
                            content: s.content,
                            image_url: s.image_url,
                            step_order: s.step_order,
                            manual_id: selectedManual.id
                        })));

                    if (stepsError) throw stepsError;
                } else {
                    // 1. Insert Manual
                    const { data: newManual, error: manualError } = await supabase
                        .from('manuals')
                        .insert([{
                            title: manualData.title,
                            category: manualData.category,
                            description: manualData.description,
                            author_id: user.id,
                            author_name: user?.user_metadata?.display_name || user?.email
                        }])
                        .select()
                        .single();

                    if (manualError) throw manualError;

                    // 2. Insert Steps
                    const { error: stepsError } = await supabase
                        .from('steps')
                        .insert(manualData.steps.map(s => ({
                            title: s.title,
                            content: s.content,
                            image_url: s.image_url,
                            step_order: s.step_order,
                            manual_id: newManual.id
                        })));

                    if (stepsError) throw stepsError;
                }
            })();

            await Promise.race([saveOperation, timeoutPromise]);

            setShowForm(false);
            setSelectedManual(null);
            fetchManuals();
        } catch (error) {
            console.error('HomePage: handleSaveManual failed:', error.message);
            alert('บันทึกข้อมูลไม่สำเร็จ: ' + error.message);
            throw error;
        }
    };

    const handleDeleteManual = (id) => {
        setConfirmation({
            isOpen: true,
            type: 'delete',
            id: id,
            title: 'ลบคู่มือ',
            message: 'คุณแน่ใจหรือไม่ว่าต้องการลบคู่มือนี้? ข้อมูลทั้งหมดรวมถึงขั้นตอนการแก้ไขจะถูกลบถาวร'
        });
    };

    const handleLogoutClick = () => {
        setConfirmation({
            isOpen: true,
            type: 'logout',
            title: 'ออกจากระบบ',
            message: 'คุณต้องการออกจากระบบใช่หรือไม่?'
        });
    };

    const handleConfirmAction = async () => {
        if (confirmation.type === 'logout') {
            await signOut();
        } else if (confirmation.type === 'delete') {
            await executeDeleteManual(confirmation.id);
        }
    };

    const executeDeleteManual = async (id) => {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Delete timeout: Operation took too long')), 5000)
        );

        try {
            const deleteOperation = supabase
                .from('manuals')
                .delete()
                .eq('id', id);

            const { error } = await Promise.race([deleteOperation, timeoutPromise]);

            if (error) throw error;
            fetchManuals();
        } catch (error) {
            console.error('HomePage: handleDeleteManual failed:', error.message);
            alert('ลบข้อมูลไม่สำเร็จ: ' + error.message);
        }
    };

    const filteredManuals = manuals.filter(m => {
        const matchesSearch =
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Navigation */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                            < BookOpen size={24} />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight hidden sm:block">
                            IT TROUBLE<span className="text-indigo-600 underline decoration-indigo-200 dark:decoration-indigo-900 decoration-4 underline-offset-4">SHOOTER</span>
                        </h1>
                        <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight block sm:hidden">
                            IT<span className="text-indigo-600">TS</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-4">
                        {profile?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group"
                                title="จัดการหลังบ้าน"
                            >
                                <ShieldCheck size={22} className="group-hover:scale-110 transition-transform" />
                                <span className="hidden md:block text-sm font-bold">Admin</span>
                            </Link>
                        )}

                        <button
                            onClick={toggleTheme}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
                            title={isDarkMode ? 'เปิดโหมดสว่าง' : 'เปิดโหมดมืด'}
                        >
                            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
                        </button>

                        <div className="text-right hidden lg:block mr-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logged in as</p>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-300">{profile?.display_name || user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogoutClick}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                            title="ออกจากระบบ"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-12">
                {fetchError && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-bold text-sm">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                            <p className="text-xs opacity-80">{fetchError}</p>
                        </div>
                        <button
                            onClick={fetchManuals}
                            className="ml-auto px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    </div>
                )}
                {/* Hero / Controls */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white leading-tight">
                            ค้นหาและสร้าง <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">คู่มือแก้ไขปัญหา</span>
                        </h2>
                        <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium">
                            รวบรวมวิธีแก้ปัญหาทางเทคนิคของคุณไว้ที่เดียว เพื่อแบ่งปันให้กับคนในทีม
                        </p>
                    </div>

                    <button
                        onClick={() => { setSelectedManual(null); setShowForm(true); }}
                        className="w-full sm:w-auto bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-black px-6 py-3 md:px-8 md:py-4 rounded-2xl shadow-xl dark:shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 group flex-shrink-0"
                    >
                        <Plus size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
                        เริ่มสร้างคู่มือใหม่
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 p-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหาตามหัวข้อ หรือรายละเอียด..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600 dark:text-slate-300 bg-transparent"
                        />
                    </div>
                    <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar pb-4 md:pb-2">
                        {['All', 'Network', 'Printer', 'Software', 'Hardware'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`flex-shrink-0 px-4 py-2 md:px-5 md:py-2 rounded-xl text-sm font-bold transition-all ${categoryFilter === cat
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-400">
                        <Loader2 size={48} className="animate-spin text-indigo-500" />
                        <p className="font-bold animate-pulse">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : filteredManuals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredManuals.map(manual => (
                            <ManualCard
                                key={manual.id}
                                manual={manual}
                                onEdit={(m) => { setSelectedManual(m); setShowForm(true); }}
                                onDelete={handleDeleteManual}
                                onClick={setViewingManual}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="text-6xl mb-6">🏜️</div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">ยังไม่พบคู่มือที่ต้องการ</h3>
                        <p className="text-slate-500 dark:text-slate-400">คุณสามารถเริ่มสร้างคู่มือฉบับแรกได้ด้วยตัวเองเลยวันนี้!</p>
                    </div>
                )}
            </main>

            {/* Modals */}
            {showForm && (
                <ManualForm
                    manual={selectedManual}
                    onSave={handleSaveManual}
                    onCancel={() => { setShowForm(false); setSelectedManual(null); }}
                />
            )}

            {viewingManual && (
                <ManualDetail
                    manual={viewingManual}
                    onClose={() => setViewingManual(null)}
                />
            )}

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmAction}
                title={confirmation.title}
                message={confirmation.message}
                confirmText={confirmation.type === 'logout' ? 'ออกจากระบบ' : 'ลบข้อมูล'}
                cancelText="ยกเลิก"
            />

            <footer className="mt-20 py-10 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 text-sm">
                <p>© 2026 IT Troubleshooting Guide Management System. Built with React & Supabase.</p>
            </footer>
        </div>
    );
};

export default HomePage;
