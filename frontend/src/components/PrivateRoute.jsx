import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;