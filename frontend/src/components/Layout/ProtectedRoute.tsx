import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state: any) => state.auth);

  if (!token) {
    return <Navigate to="/login-passcode" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

export const AuthenticatedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { token } = useSelector((state: any) => state.auth);
  return token ? <Navigate to="/" /> : children;
};
