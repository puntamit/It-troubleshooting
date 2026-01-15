import React from 'react';
import Register from '../components/auth/Register';

const RegisterPage = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
            <Register />
        </div>
    );
};

export default RegisterPage;
