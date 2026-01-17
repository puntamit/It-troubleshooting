import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, AlertCircle, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ManualForm = ({ manual, onSave, onCancel }) => {
    const isEditing = !!manual;
    const [title, setTitle] = useState(manual?.title || '');
    const [category, setCategory] = useState(manual?.category || 'Software');
    const [description, setDescription] = useState(manual?.description || '');
    const [steps, setSteps] = useState(manual?.steps || [
        { title: '', content: '', image_url: '', step_order: 1 }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState({});

    const handleFileUpload = async (index, file) => {
        if (!file) return;

        setUploading(prev => ({ ...prev, [index]: true }));
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('manual-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('manual-images')
                .getPublicUrl(filePath);

            handleStepChange(index, 'image_url', publicUrl);
        } catch (err) {
            console.error('Upload error details:', err);
            alert('อัปโหลดรูปภาพไม่สำเร็จ: ' + err.message);
        } finally {
            setUploading(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleAddStep = () => {
        setSteps([...steps, { title: '', content: '', image_url: '', step_order: steps.length + 1 }]);
    };

    const handleRemoveStep = (index) => {
        if (steps.length <= 1) return;
        const newSteps = steps.filter((_, i) => i !== index);
        // Update step orders
        const updatedSteps = newSteps.map((step, i) => ({ ...step, step_order: i + 1 }));
        setSteps(updatedSteps);
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!title.trim() || !description.trim()) {
            return setError('กรุณากรอกหัวข้อและคำอธิบาย');
        }

        if (steps.some(s => !s.title.trim() || !s.content.trim())) {
            return setError('กรุณากรอกข้อมูลในขั้นตอนให้ครบถ้วน');
        }

        setLoading(true);
        try {
            const manualData = {
                title,
                category,
                description,
                steps: steps.map((s, i) => ({ ...s, step_order: i + 1 }))
            };
            await onSave(manualData);
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border dark:border-slate-800">
                {/* Header */}
                <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">
                            {isEditing ? 'แก้ไขคู่มือ' : 'สร้างคู่มือใหม่'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">กรอกข้อมูลให้ครบถ้วนเพื่อสร้างคู่มือที่มีคุณภาพ</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <form id="manual-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-8">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {/* Basic Info Container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">หัวข้อปัญหา *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="เช่น การตั้งค่า Wi-Fi สำหรับ Printer"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">หมวดหมู่ *</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                            >
                                <option value="Network">Network</option>
                                <option value="Printer">Printer</option>
                                <option value="Software">Software</option>
                                <option value="Hardware">Hardware</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">รายละเอียดสั้นๆ *</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
                                placeholder="อธิบายภาพรวมของปัญหานี้..."
                                required
                            />
                        </div>
                    </div>

                    {/* Steps Builder */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">ขั้นตอนการแก้ไข</h3>
                            <button
                                type="button"
                                onClick={handleAddStep}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all text-sm"
                            >
                                <Plus size={18} />
                                เพิ่มขั้นตอน
                            </button>
                        </div>

                        <div className="space-y-6">
                            {steps.map((step, index) => (
                                <div key={index} className="relative p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                                    <div className="absolute -left-3 top-6 w-8 h-8 bg-slate-800 dark:bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md">
                                        {index + 1}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveStep(index)}
                                        className="absolute -right-2 -top-2 p-2 bg-red-50 dark:bg-red-900 text-red-500 dark:text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-red-100 dark:border-red-900 shadow-sm"
                                        title="ลบขั้นตอนนี้"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="space-y-4 ml-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">หัวข้อขั้นตอน</label>
                                            <input
                                                type="text"
                                                value={step.title}
                                                onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                                                className="w-full px-0 py-2 text-lg font-bold border-b border-slate-100 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                                placeholder="เช่น ตรวจสอบสายเชื่อมต่อ"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">รายละเอียด</label>
                                            <textarea
                                                value={step.content}
                                                onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                                                className="w-full px-0 py-2 border-b border-slate-100 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 focus:border-indigo-500 outline-none transition-all h-20 resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                                placeholder="อธิบายว่าต้องทำอย่างไรในขั้นตอนนี้..."
                                                required
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">รูปภาพประกอบ</label>
                                            <div className="flex flex-wrap gap-4 items-start">
                                                {step.image_url ? (
                                                    <div className="relative group/img w-32 h-32 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                        <img src={step.image_url} alt="Step preview" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStepChange(index, 'image_url', '')}
                                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="text-white" size={20} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="w-32 h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-indigo-500">
                                                        {uploading[index] ? (
                                                            <Loader2 className="animate-spin" size={24} />
                                                        ) : (
                                                            <>
                                                                <Upload size={24} />
                                                                <span className="text-[10px] font-bold">เลือกไฟล์</span>
                                                            </>
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleFileUpload(index, e.target.files[0])}
                                                            disabled={uploading[index]}
                                                        />
                                                    </label>
                                                )}

                                                <div className="flex-1 min-w-[200px]">
                                                    <input
                                                        type="text"
                                                        value={step.image_url || ''}
                                                        onChange={(e) => handleStepChange(index, 'image_url', e.target.value)}
                                                        className="w-full px-0 py-2 border-b border-slate-100 dark:border-slate-800 bg-transparent text-xs text-slate-400 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                                        placeholder="หรือวาง URL รูปภาพที่นี่..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        ยกเลิก
                    </button>
                    <button
                        form="manual-form"
                        type="submit"
                        disabled={loading || Object.values(uploading).some(v => v)}
                        className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <Save size={20} />
                        )}
                        {isEditing ? 'บันทึกการแก้ไข' : 'สร้างคู่มือเลย'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualForm;
