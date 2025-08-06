import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
    const { isAuth } = useContext(UserContext);

    if (!isAuth) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
