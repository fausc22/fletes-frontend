// components/AuthProvider.js - SISTEMA DE FLETES SIMPLIFICADO - VERSIÓN CORREGIDA
import React, { createContext, useContext } from 'react';
import useAuth from '../hooks/useAuth';

// ✅ Crear contexto
const AuthContext = createContext();

// ✅ Provider simplificado SIN ROLES
export function AuthProvider({ children }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook para usar el contexto
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}

// ✅ HOC SIMPLIFICADO PARA FLETES - SIN LÓGICA DE ROLES - CORREGIDO PARA HIDRATACIÓN
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading, mounted } = useAuthContext();

    // ✅ NO RENDERIZAR HASTA QUE ESTÉ MONTADO
    if (!mounted) {
      return null;
    }

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-orange-800">Cargando...</span>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acceso no autorizado
            </h2>
            <p className="text-gray-600">
              Por favor, inicie sesión para continuar
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}