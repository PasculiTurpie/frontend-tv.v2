import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
    const { isAuth } = useContext(UserContext);
    console.log("isAuth en ProtectedRoute:", isAuth);

    return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
