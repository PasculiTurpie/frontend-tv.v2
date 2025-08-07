import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

const ProtectedRoute = () => {
  const { isAuth, loading } = useContext(UserContext);

  if (loading) {
    return <LoadingSpinner />; // o spinner
  }

  if (!isAuth) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
