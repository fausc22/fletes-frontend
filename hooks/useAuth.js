// hooks/useAuth.js - VERSIÓN CORREGIDA PARA EVITAR ERRORES DE HIDRATACIÓN
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

// ✅ HELPER PARA SSR - EVITAR HIDRATION MISMATCH
const isClient = () => typeof window !== 'undefined';

export default function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // ✅ NUEVA STATE
  const [tokenCheckInterval, setTokenCheckInterval] = useState(null);
  const initialized = useRef(false);

  // ✅ EVITAR HYDRATION MISMATCH
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // ✅ Solo inicializar en el cliente y cuando esté montado
    if (!isClient() || !mounted) {
      setLoading(false);
      return;
    }

    // Evitar doble inicialización
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      try {
        console.log('🔍 SISTEMA DE FLETES - Inicializando auth...', {
          pathname: router.pathname,
          isClient: isClient(),
          mounted
        });

        // Si estamos en login, no verificar auth
        if (router.pathname === '/login') {
          console.log('📍 En página de login, no verificar auth');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const usuario = localStorage.getItem('usuario');
        
        console.log('🔍 Verificando localStorage:', {
          hasToken: !!token,
          hasUsuario: !!usuario,
          tokenStart: token ? token.substring(0, 20) + '...' : 'NO',
        });

        if (!token) {
          console.log('🔒 SISTEMA DE FLETES: No hay token, redirigiendo al login');
          router.push('/login');
          return;
        }

        // ✅ PWA: Verificar si tenemos refresh token en localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('🔑 SISTEMA DE FLETES: Refresh token disponible:', !!refreshToken);

        // ✅ Cargar datos del usuario
        await loadUserData();
        
        // ✅ Iniciar verificación periódica optimizada para PWA
        startTokenVerification();

      } catch (error) {
        console.error('❌ SISTEMA DE FLETES: Error inicializando autenticación:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
      }
    };
  }, [router.pathname, mounted]); // ✅ AGREGAR mounted COMO DEPENDENCIA

  // ✅ CARGAR DATOS DEL USUARIO - ADAPTADO PARA FLETES
  const loadUserData = async () => {
    if (!isClient() || !mounted) return;

    try {
      console.log('👤 SISTEMA DE FLETES: Cargando datos del usuario...');
      
      // Primero intentar obtener del localStorage
      const user = apiClient.getUserFromStorage();
      
      if (user) {
        console.log('✅ Usuario encontrado en localStorage:', user);
        setUser(user);
        return;
      }

      console.log('🌐 Usuario no en localStorage, consultando backend...');
      
      // Si no hay datos locales, obtener del backend
      const profileResponse = await apiClient.axiosAuth.get('/auth/profile');
      const usuario = profileResponse.data.usuario;
      
      console.log('✅ Usuario obtenido del backend:', usuario);
      
      // ✅ Actualizar localStorage con estructura simplificada
      localStorage.setItem('usuario', JSON.stringify(usuario));
      
      setUser(usuario);

    } catch (error) {
      console.error('❌ SISTEMA DE FLETES: Error cargando datos del usuario:', error);
      throw error;
    }
  };

  // ✅ VERIFICACIÓN PERIÓDICA OPTIMIZADA PARA PWA
  const startTokenVerification = () => {
    if (!isClient() || !mounted) return;

    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
    }

    const interval = apiClient.startTokenCheck();
    setTokenCheckInterval(interval);
  };

  // ✅ FUNCIÓN DE LOGOUT PARA PWA
  const logout = async () => {
    try {
      console.log('👋 SISTEMA DE FLETES: Cerrando sesión...');
      
      // Limpiar intervalo
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
        setTokenCheckInterval(null);
      }
      
      // Logout en el backend
      await apiClient.logout();
      
      // Limpiar estado local
      setUser(null);
      
      // Redirigir al login
      if (isClient() && mounted) {
        router.push('/login');
        toast.success('Sesión cerrada correctamente');
      }
      
    } catch (error) {
      console.error('❌ SISTEMA DE FLETES: Error en logout:', error);
      
      // Forzar limpieza local
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
        setTokenCheckInterval(null);
      }
      
      apiClient.clearLocalStorage();
      setUser(null);
      
      if (isClient() && mounted) {
        router.push('/login');
      }
    }
  };

  // ✅ FUNCIÓN DE LOGIN MEJORADA PARA PWA - ADAPTADA PARA FLETES
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      console.log('🔐 SISTEMA DE FLETES: Intentando login...');
      
      const result = await apiClient.login(credentials);
      
      if (result.success) {
        const { usuario } = result.data;
        
        console.log('✅ SISTEMA DE FLETES: Login exitoso para:', usuario.usuario);
        
        setUser(usuario);
        
        // Iniciar verificación de tokens
        startTokenVerification();
        
        // ✅ Toast informativo específico para PWA
        if (result.data.hasRefreshToken) {
          const isPWA = mounted && window.matchMedia('(display-mode: standalone)').matches;
          if (isPWA) {
            toast.success(`¡Bienvenido ${usuario.usuario}! Tu sesión se mantendrá activa en la PWA por 7 días.`);
          } else {
            toast.success(`¡Bienvenido ${usuario.usuario}! Tu sesión se mantendrá activa por 7 días.`);
          }
        } else {
          toast.success(`¡Bienvenido ${usuario.usuario}!`);
        }
        
        return { success: true, usuario };
      } else {
        console.log('❌ SISTEMA DE FLETES: Login fallido:', result.error);
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      console.error('❌ SISTEMA DE FLETES: Error en login:', error);
      return { success: false, error: 'Error inesperado durante el login' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIONES DE VERIFICACIÓN SIMPLIFICADAS PARA FLETES
  const isAuthenticated = () => {
    if (!isClient() || !mounted) return false;
    const token = localStorage.getItem('token');
    return !!token && !!user;
  };

  // ✅ VERIFICAR CONECTIVIDAD
  const checkConnection = async () => {
    try {
      await apiClient.axiosAuth.get('/auth/health');
      return { success: true, message: 'Conexión exitosa' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error de conexión' 
      };
    }
  };

  // ✅ FORZAR RENOVACIÓN DE TOKEN PARA PWA
  const forceTokenRefresh = async () => {
    try {
      await apiClient.refreshToken();
      await loadUserData();
      
      if (isClient() && mounted) {
        toast.success('Token renovado exitosamente');
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ SISTEMA DE FLETES: Error forzando renovación:', error);
      
      if (isClient() && mounted) {
        toast.error('Error renovando token');
      }
      
      await logout();
      return { success: false, error: error.message };
    }
  };

  // ✅ NUEVA FUNCIÓN: Obtener información de debug PWA
  const getAuthDebugInfo = () => {
    if (!isClient() || !mounted) return { error: 'No disponible en SSR' };
    
    return {
      ...apiClient.getAuthDebugInfo(),
      hook: {
        userLoaded: !!user,
        loading,
        mounted,
        intervalActive: !!tokenCheckInterval,
        initialized: initialized.current
      }
    };
  };

  // ✅ NUEVA FUNCIÓN: Obtener estado de PWA
  const getPWAStatus = () => {
    if (!isClient() || !mounted) return { error: 'No disponible en SSR' };
    
    return apiClient.getPWAStatus();
  };

  // ✅ NUEVA FUNCIÓN: Manejar reactivación de PWA
  const handlePWAResume = async () => {
    if (!mounted) return;
    
    console.log('🔄 SISTEMA DE FLETES: Handling resume...');
    
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!token && refreshToken) {
        console.log('🔄 SISTEMA DE FLETES: No access token pero sí refresh token, renovando...');
        await forceTokenRefresh();
      } else if (apiClient.isTokenExpired() && refreshToken && !apiClient.isRefreshTokenExpired()) {
        console.log('🔄 SISTEMA DE FLETES: Token expirado, renovando...');
        await forceTokenRefresh();
      } else if (!token && !refreshToken) {
        console.log('❌ SISTEMA DE FLETES: No hay tokens, redirigiendo a login...');
        await logout();
      }
    } catch (error) {
      console.error('❌ SISTEMA DE FLETES: Error en resume:', error);
      await logout();
    }
  };

  // ✅ NUEVA FUNCIÓN: Verificar salud de autenticación
  const checkAuthHealth = () => {
    if (!isClient() || !mounted) return { healthy: false, reason: 'SSR' };

    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const usuario = localStorage.getItem('usuario');

    if (!token) {
      return { healthy: false, reason: 'No access token' };
    }

    if (apiClient.isTokenExpired()) {
      if (refreshToken && !apiClient.isRefreshTokenExpired()) {
        return { healthy: true, reason: 'Token expired but refresh available', action: 'refresh' };
      } else {
        return { healthy: false, reason: 'Both tokens expired', action: 'login' };
      }
    }

    if (!usuario) {
      return { healthy: false, reason: 'No user data' };
    }

    return { healthy: true, reason: 'All good' };
  };

  return { 
    user, 
    loading, 
    mounted, // ✅ EXPORTAR mounted para que otros componentes puedan usarlo
    login,
    logout, 
    isAuthenticated,
    checkConnection,
    forceTokenRefresh,
    
    // ✅ NUEVAS FUNCIONES ESPECÍFICAS PARA PWA
    getAuthDebugInfo,
    getPWAStatus,
    handlePWAResume,
    checkAuthHealth,
    
    // ✅ Debug info mejorada para PWA
    debug: {
      hasToken: isClient() && mounted ? !!localStorage.getItem('token') : false,
      hasRefreshToken: isClient() && mounted ? !!localStorage.getItem('refreshToken') : false,
      intervalActive: !!tokenCheckInterval,
      isClient: isClient(),
      mounted,
      isPWA: isClient() && mounted ? window.matchMedia('(display-mode: standalone)').matches : false
    }
  };
}

// ✅ HOOK SIMPLE PARA VERIFICAR AUTH SIN LÓGICA COMPLETA
export function useAuthSimple() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isClient() || !mounted) return;
    
    if (router.pathname === '/login') return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router.pathname, mounted]);
}

// ✅ HOOK PARA OBTENER USUARIO ACTUAL - ADAPTADO PARA FLETES
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isClient() || !mounted) return;

    const loadUser = () => {
      const user = apiClient.getUserFromStorage();
      setUser(user);
    };

    loadUser();
  }, [mounted]);

  return user;
}

// ✅ NUEVO HOOK: Monitor de PWA
export function usePWAMonitor() {
  const [isOnline, setIsOnline] = useState(true);
  const [pwaStatus, setPwaStatus] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isClient() || !mounted) return;

    // Monitorear estado online/offline
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 SISTEMA DE FLETES: Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 SISTEMA DE FLETES: Conexión perdida');
    };

    // Monitorear cambios de visibilidad (PWA suspend/resume)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ SISTEMA DE FLETES: Visible');
        setPwaStatus('active');
      } else {
        console.log('🙈 SISTEMA DE FLETES: Hidden');
        setPwaStatus('background');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Estado inicial
    setIsOnline(navigator.onLine);
    setPwaStatus(document.visibilityState === 'visible' ? 'active' : 'background');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mounted]);

  return {
    isOnline,
    pwaStatus,
    mounted,
    isPWA: isClient() && mounted ? window.matchMedia('(display-mode: standalone)').matches : false
  };
}