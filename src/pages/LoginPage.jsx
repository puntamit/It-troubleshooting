import React from 'react';
import Login from '../components/auth/Login';

const LoginPage = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
            <Login />
        </div>
    );
};

export default LoginPage;
