import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

const AdminRoute = ({ children }) => {
    const { profile, loading } = useAuth();

    if (loading) {
        return <Loading message="กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ..." />;
    }

    if (!profile || profile.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
