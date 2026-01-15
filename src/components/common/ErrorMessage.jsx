import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="font-bold text-lg mb-1">เกิดข้อผิดพลาด</h3>
            <p className="mb-4">{message || 'ไม่สามารถโหลดข้อมูลได้ในขณะนี้'}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    ลองใหม่อีกครั้ง
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
