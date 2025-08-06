import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = () => {
    const { isAuth } = useContext(UserContext);
    console.log("isAuth en ProtectedRoute:", isAuth);

    return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
