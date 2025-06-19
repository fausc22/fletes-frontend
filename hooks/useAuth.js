// hooks/useAuth.js - Versión corregida para SSR
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

// ===== HELPER PARA SSR =====
const isClient = () => typeof window !== 'undefined';

export default function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenCheckInterval, setTokenCheckInterval] = useState(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (!isClient()) {
      setLoading(false);
      return;
    }

    // Evitar doble inicialización en desarrollo
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      try {
        // Si estamos en login, no verificar auth
        if (router.pathname === '/login') {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('🔒 No hay token, redirigiendo al login');
          router.push('/login');
          return;
        }

        // Verificar si el token está expirado
        if (apiClient.isTokenExpired()) {
          console.log('⏰ Token expirado, intentando renovar...');
          
          try {
            await apiClient.refreshToken();
            console.log('✅ Token renovado exitosamente');
          } catch (error) {
            console.log('❌ No se pudo renovar el token, redirigiendo al login');
            router.push('/login');
            return;
          }
        }

        // Cargar datos del usuario
        await loadUserData();
        
        // Iniciar verificación periódica de tokens
        startTokenVerification();

      } catch (error) {
        console.error('❌ Error inicializando autenticación:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup al desmontar
    return () => {
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
      }
    };
  }, [router.pathname]);

  // ===== CARGAR DATOS DEL USUARIO =====
  const loadUserData = async () => {
    if (!isClient()) return;

    try {
      // Intentar obtener del localStorage primero
      const user = apiClient.getUserFromStorage();
      
      if (user) {
        setUser(user);
        return;
      }

      // Si no hay datos en localStorage, obtener del backend
      try {
        const profileResponse = await apiClient.axiosAuth.get('/auth/profile');
        const empleado = profileResponse.data.empleado;
        
        // Actualizar localStorage
        localStorage.setItem('empleado', JSON.stringify(empleado));
        localStorage.setItem('role', empleado.rol);
        
        setUser(empleado);
      } catch (profileError) {
        console.error('❌ Error obteniendo perfil del backend:', profileError);
        throw profileError;
      }

    } catch (error) {
      console.error('❌ Error cargando datos del usuario:', error);
      throw error;
    }
  };

  // ===== INICIAR VERIFICACIÓN PERIÓDICA =====
  const startTokenVerification = () => {
    if (!isClient()) return;

    // Limpiar intervalo anterior si existe
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
    }

    // Iniciar nuevo intervalo
    const interval = apiClient.startTokenCheck();
    setTokenCheckInterval(interval);
  };

  // ===== FUNCIÓN DE LOGOUT =====
  const logout = async () => {
    try {
      console.log('👋 Cerrando sesión...');
      
      // Limpiar intervalo de verificación
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
        setTokenCheckInterval(null);
      }
      
      // Logout en el backend
      await apiClient.logout();
      
      // Limpiar estado local
      setUser(null);
      
      // Redirigir al login
      if (isClient()) {
        router.push('/login');
        toast.success('Sesión cerrada correctamente');
      }
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
      
      // Forzar limpieza local incluso si falla el backend
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
        setTokenCheckInterval(null);
      }
      
      apiClient.clearLocalStorage();
      setUser(null);
      
      if (isClient()) {
        router.push('/login');
      }
    }
  };

  // ===== FUNCIÓN DE LOGIN =====
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      const result = await apiClient.login(credentials);
      
      if (result.success) {
        const { empleado } = result.data;
        
        setUser(empleado);
        
        // Iniciar verificación de tokens
        startTokenVerification();
        
        if (isClient() && typeof toast !== 'undefined') {
          toast.success(`¡Bienvenido ${empleado.nombre} ${empleado.apellido}!`);
        }
        
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

  // ===== FUNCIONES DE AUTORIZACIÓN =====
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

  const isManager = () => hasRole('GERENTE');
  const canSell = () => hasRole(['GERENTE', 'VENDEDOR']);
  
  const isAuthenticated = () => {
    if (!isClient()) return false;
    const token = localStorage.getItem('token');
    return !!token && !!user && !apiClient.isTokenExpired();
  };

  // ===== FUNCIÓN PARA VERIFICAR CONECTIVIDAD =====
  const checkConnection = async () => {
    try {
      await apiClient.axiosAuth.get('/health');
      return { success: true, message: 'Conexión exitosa' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error de conexión' 
      };
    }
  };

  // ===== FUNCIÓN PARA FORZAR RENOVACIÓN DE TOKEN =====
  const forceTokenRefresh = async () => {
    try {
      await apiClient.refreshToken();
      await loadUserData();
      
      if (isClient() && typeof toast !== 'undefined') {
        toast.success('Token renovado exitosamente');
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error forzando renovación:', error);
      
      if (isClient() && typeof toast !== 'undefined') {
        toast.error('Error renovando token');
      }
      
      await logout();
      return { success: false, error: error.message };
    }
  };

  return { 
    user, 
    loading, 
    login,
    logout, 
    hasRole, 
    isManager, 
    canSell,
    isAuthenticated,
    checkConnection,
    forceTokenRefresh,
    // Información adicional para debugging
    debug: {
      tokenExpired: isClient() ? apiClient.isTokenExpired() : false,
      hasToken: isClient() ? !!localStorage.getItem('token') : false,
      intervalActive: !!tokenCheckInterval,
      isClient: isClient()
    }
  };
}

// ===== HOOK SIMPLE PARA PÁGINAS QUE SOLO NECESITAN VERIFICAR AUTH =====
export function useAuthSimple() {
  const router = useRouter();

  useEffect(() => {
    if (!isClient()) return;
    
    if (router.pathname === '/login') return;
    
    const token = localStorage.getItem('token');
    if (!token || apiClient.isTokenExpired()) {
      router.push('/login');
    }
  }, [router.pathname]);
}

// ===== HOOK PARA OBTENER INFORMACIÓN DEL USUARIO SIN LÓGICA COMPLETA =====
export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isClient()) return;

    const loadUser = () => {
      const user = apiClient.getUserFromStorage();
      setUser(user);
    };

    loadUser();
  }, []);

  return user;
}