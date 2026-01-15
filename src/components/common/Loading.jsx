import React from 'react';

const Loading = ({ message = 'กำลังโหลด...' }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">{message}</p>
        </div>
    );
};

export default Loading;
