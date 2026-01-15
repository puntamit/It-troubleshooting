import React from 'react';
import { X, Clock, User, ChevronRight } from 'lucide-react';

const ManualDetail = ({ manual, onClose }) => {
    if (!manual) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border dark:border-slate-800">
                {/* Header */}
                <div className="relative p-8 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-4">
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {manual.category}
                        </span>
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 leading-tight">
                        {manual.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 font-medium">
                            <Clock size={16} className="text-slate-400" />
                            {new Date(manual.created_at).toLocaleDateString('th-TH')}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                            <User size={16} className="text-slate-400" />
                            {manual.author_name || 'ไม่ระบุชื่อ'}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-indigo-200 dark:border-indigo-900 pl-4">
                            {manual.description}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <ChevronRight className="text-indigo-500" />
                            ลำดับขั้นตอนการแก้ไข
                        </h3>

                        <div className="space-y-4">
                            {(manual.steps || []).sort((a, b) => a.step_order - b.step_order).map((step, index) => (
                                <div key={step.id || index} className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 group hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all">
                                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none">
                                        {index + 1}
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                                            {step.title}
                                        </h4>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {step.content}
                                        </p>
                                        {step.image_url && (
                                            <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-md bg-white dark:bg-slate-900">
                                                <img
                                                    src={step.image_url}
                                                    alt={step.title}
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-800 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualDetail;
