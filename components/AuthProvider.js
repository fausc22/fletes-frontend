// components/AuthProvider.js - Corregido para SSR
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/login', '/'];

// ===== HELPER PARA SSR =====
const isClient = () => typeof window !== 'undefined';

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (!isClient()) {
      setLoading(false);
      return;
    }

    if (initialized) return;
    
    initializeAuth();
    setInitialized(true);
  }, []);

  const initializeAuth = async () => {
    try {
      // Si estamos en una ruta pública, no verificar auth
      if (PUBLIC_ROUTES.includes(router.pathname)) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('🔒 No hay token, redirigiendo al login');
        router.replace('/login');
        return;
      }

      // Verificar si el token está expirado
      if (apiClient.isTokenExpired()) {
        console.log('⏰ Token expirado, intentando renovar...');
        
        try {
          await apiClient.refreshToken();
          console.log('✅ Token renovado exitosamente');
        } catch (error) {
          console.log('❌ No se pudo renovar el token');
          await handleLogout(false); // false = no mostrar toast
          return;
        }
      }

      // Cargar datos del usuario
      await loadUser();
      
      // Iniciar verificación periódica
      apiClient.startTokenCheck();

    } catch (error) {
      console.error('❌ Error inicializando autenticación:', error);
      await handleLogout(false);
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    if (!isClient()) return;

    try {
      // Intentar obtener del localStorage primero
      const user = apiClient.getUserFromStorage();
      
      if (user) {
        setUser(user);
        return;
      }

      // Si no hay datos en localStorage, obtener del backend
      const response = await apiClient.axiosAuth.get('/auth/profile');
      const empleado = response.data.empleado;
      
      localStorage.setItem('empleado', JSON.stringify(empleado));
      localStorage.setItem('role', empleado.rol);
      
      setUser(empleado);
    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
      throw error;
    }
  };

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      
      const result = await apiClient.login(credentials);
      
      if (result.success) {
        const { empleado } = result.data;
        setUser(empleado);
        
        // Iniciar verificación de tokens
        apiClient.startTokenCheck();
        
        return { success: true, empleado };
      } else {
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { success: false, error: 'Error inesperado durante el login' };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (showToast = true) => {
    try {
      await apiClient.logout();
      setUser(null);
      
      if (showToast && isClient() && typeof toast !== 'undefined') {
        toast.success('Sesión cerrada correctamente');
      }
      
      if (isClient()) {
        router.replace('/login');
      }
    } catch (error) {
      console.error('❌ Error en logout:', error);
      
      // Forzar limpieza local
      apiClient.clearLocalStorage();
      setUser(null);
      
      if (isClient()) {
        router.replace('/login');
      }
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') {
      return user.rol === roles;
    }
    if (Array.isArray(roles)) {
      return roles.includes(user.rol);
    }
    return false;
  };

  const value = {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    hasRole,
    isManager: () => hasRole('GERENTE'),
    canSell: () => hasRole(['GERENTE', 'VENDEDOR']),
    isAuthenticated: () => {
      if (!isClient()) return false;
      return !!user && !!localStorage.getItem('token');
    },
    refetchUser: loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Componente para proteger rutas
export function ProtectedRoute({ children, requiredRole = null, fallback = null }) {
  const { user, loading, hasRole } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && isClient()) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Cargando...</span>
        </div>
      )
    );
  }

  if (!user) {
    return null; // Se redirige en el useEffect
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="text-sm text-gray-500">
            Rol requerido: {Array.isArray(requiredRole) ? requiredRole.join(' o ') : requiredRole}
          </p>
          <p className="text-sm text-gray-500">
            Tu rol actual: {user.rol}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return children;
}