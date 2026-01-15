import React from 'react';
import { Edit2, Trash2, BookOpen } from 'lucide-react';

const ManualCard = ({ manual, onEdit, onDelete, onClick }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryStyles = (category) => {
        switch (category?.toLowerCase()) {
            case 'network': return 'bg-indigo-50 text-indigo-600';
            case 'printer': return 'bg-pink-50 text-pink-600';
            case 'software': return 'bg-emerald-50 text-emerald-600';
            case 'hardware': return 'bg-amber-50 text-amber-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    return (
        <div
            onClick={() => onClick(manual)}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all cursor-pointer transform hover:-translate-y-1"
        >
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getCategoryStyles(manual.category)}`}>
                    {manual.category}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(manual); }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(manual.id); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                {manual.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                {manual.description}
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{manual.steps?.length || 0} ขั้นตอน</span>
                </div>
                <span>📅 {formatDate(manual.created_at)}</span>
                {manual.author_name && (
                    <span className="truncate max-w-[100px]">👤 {manual.author_name}</span>
                )}
            </div>
        </div>
    );
};

export default ManualCard;
