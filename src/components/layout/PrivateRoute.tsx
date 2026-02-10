import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-steel-600 border-t-accent-500 rounded-full animate-spin" />
          <p className="text-silver-500 text-sm font-mono">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated
    ? <>{children}</>
    : <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

export default PrivateRoute;
