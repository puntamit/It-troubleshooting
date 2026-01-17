import React from 'react';
import { AlertTriangle, LogOut, Check, X, AlertCircle } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger' | 'info' | 'success'
    icon = null
}) => {
    if (!isOpen) return null;

    // Determine styles based on variant
    const variantStyles = {
        danger: {
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            buttonBg: 'bg-red-600 hover:bg-red-700',
            buttonText: 'text-white',
            defaultIcon: <AlertTriangle size={24} />
        },
        info: {
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
            buttonText: 'text-white',
            defaultIcon: <AlertCircle size={24} />
        },
        success: {
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
            buttonText: 'text-white',
            defaultIcon: <Check size={24} />
        }
    };

    const style = variantStyles[variant] || variantStyles.danger;
    const DisplayIcon = icon || style.defaultIcon;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col items-center p-6 md:p-8 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 text-center">

                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${style.iconBg} ${style.iconColor} shadow-inner`}>
                    {DisplayIcon}
                </div>

                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                    {title}
                </h3>

                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-3 font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${style.buttonBg} ${style.buttonText}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
