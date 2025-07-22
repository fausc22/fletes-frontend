import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ✅ HELPER FUNCTIONS PARA SSR
const isClient = () => typeof window !== 'undefined';

const getFromStorage = (key) => {
  if (!isClient()) return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error accessing localStorage for key ${key}:`, error);
    return null;
  }
};

const setToStorage = (key, value) => {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting localStorage for key ${key}:`, error);
  }
};

const removeFromStorage = (key) => {
  if (!isClient()) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage for key ${key}:`, error);
  }
};

// ✅ Instancia de axios para login SIN interceptores
export const axiosLogin = axios.create({
  baseURL: apiUrl,
  withCredentials: false, // ✅ PWA: Sin cookies, solo localStorage
});

// ✅ Instancia de axios autenticado CON interceptores  
export const axiosAuth = axios.create({
  baseURL: apiUrl,
  withCredentials: false, // ✅ PWA: Sin cookies, solo localStorage
});

class ApiClient {
  constructor() {
    this.baseURL = apiUrl;
    this.isRefreshing = false;
    this.failedQueue = [];
    
    // Solo configurar interceptors en el cliente
    if (isClient()) {
      this.setupInterceptors();
      this.setupPWAListeners();
    }
  }

  // ✅ CONFIGURAR listeners específicos para PWA
  setupPWAListeners() {
    // Detectar cuando la PWA se reactiva
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 PWA reactivada, verificando autenticación...');
        this.checkAuthOnPWAResume();
      }
    });

    // Detectar focus de la ventana
    window.addEventListener('focus', () => {
      console.log('🔍 PWA obtuvo focus, verificando tokens...');
      this.checkAuthOnPWAResume();
    });

    // Listener para cuando la PWA se instala
    window.addEventListener('appinstalled', () => {
      console.log('📱 PWA instalada, configurando persistencia mejorada...');
    });
  }

  // ✅ VERIFICAR autenticación al reactivar PWA
  async checkAuthOnPWAResume() {
    const token = getFromStorage('token');
    const refreshToken = getFromStorage('refreshToken');
    
    if (!token && refreshToken) {
      console.log('🔄 PWA: No hay access token pero sí refresh token, renovando...');
      try {
        await this.refreshToken();
      } catch (error) {
        console.log('❌ PWA: Error renovando al reactivar, redirigiendo a login');
        this.clearSessionAndRedirect();
      }
    } else if (this.isTokenExpired() && refreshToken && !this.isRefreshTokenExpired()) {
      console.log('🔄 PWA: Access token expirado, renovando automáticamente...');
      try {
        await this.refreshToken();
      } catch (error) {
        console.log('❌ PWA: Error renovando automáticamente');
      }
    }
  }

  setupInterceptors() {
    // ✅ REQUEST INTERCEPTOR
    axiosAuth.interceptors.request.use(
      (config) => {
        const token = getFromStorage('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ✅ RESPONSE INTERCEPTOR MEJORADO PARA PWA
    axiosAuth.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Solo manejar errores 401 que no sean del refresh endpoint
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url?.includes('/auth/refresh-token')) {
          
          originalRequest._retry = true;

          // Si ya estamos renovando, añadir a la cola
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, originalRequest });
            });
          }

          return this.handleTokenRefresh(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  // ✅ MANEJO DE REFRESH TOKEN MODIFICADO PARA PWA
  async handleTokenRefresh(originalRequest) {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, originalRequest });
      });
    }

    this.isRefreshing = true;

    try {
      console.log('🔄 PWA: Token expirado, intentando renovar...');
      
      const refreshToken = getFromStorage('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token disponible');
      }

      // ✅ PWA: Enviar refresh token en el body
      const response = await axiosLogin.post('/auth/refresh-token', {
        refreshToken: refreshToken
      });
      
      const { accessToken, usuario, expiresIn, refreshTokenExpiresIn } = response.data;
      
      // ✅ ACTUALIZAR localStorage - ADAPTADO PARA FLETES
      setToStorage('token', accessToken);
      setToStorage('usuario', JSON.stringify(usuario));
      setToStorage('tokenExpiry', (Date.now() + this.parseExpiration(expiresIn)).toString());
      
      // ✅ Actualizar información del refresh token si está disponible
      if (refreshTokenExpiresIn) {
        setToStorage('refreshTokenExpiry', (Date.now() + (refreshTokenExpiresIn * 1000)).toString());
      }
      
      console.log('✅ PWA: Token renovado exitosamente');
      
      // ✅ Procesar cola de requests fallidos
      this.processQueue(null, accessToken);
      
      // ✅ Reintentar request original
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosAuth(originalRequest);
      
    } catch (refreshError) {
      console.log('❌ PWA Error renovando token:', refreshError.response?.data?.message || refreshError.message);
      
      // ✅ Procesar cola con error
      this.processQueue(refreshError, null);
      
      // ✅ Limpiar sesión y redirigir
      this.clearSessionAndRedirect();
      
      return Promise.reject(refreshError);
    } finally {
      this.isRefreshing = false;
    }
  }

  // ✅ Procesar cola de requests
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject, originalRequest }) => {
      if (error) {
        reject(error);
      } else {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        resolve(axiosAuth(originalRequest));
      }
    });
    
    this.failedQueue = [];
  }

  // ✅ LOGIN MODIFICADO PARA PWA - ADAPTADO PARA FLETES
  async login(credentials) {
    try {
      console.log('🔐 PWA Login con credenciales:', { 
        username: credentials.username, 
        remember: credentials.remember 
      });
      
      const response = await axiosLogin.post('/auth/login', credentials);
      const { token, refreshToken, usuario, expiresIn, refreshExpiresIn, hasRefreshToken } = response.data;
      
      // ✅ GUARDAR TODO EN LOCALSTORAGE - ADAPTADO PARA FLETES
      setToStorage('token', token);
      setToStorage('usuario', JSON.stringify(usuario));
      setToStorage('tokenExpiry', (Date.now() + this.parseExpiration(expiresIn)).toString());
      
      // ✅ PWA: Guardar refresh token en localStorage si está disponible
      if (hasRefreshToken && refreshToken) {
        setToStorage('refreshToken', refreshToken);
        setToStorage('hasRefreshToken', 'true');
        
        if (refreshExpiresIn) {
          const refreshExpiryTime = Date.now() + this.parseExpiration(refreshExpiresIn);
          setToStorage('refreshTokenExpiry', refreshExpiryTime.toString());
          console.log(`🔑 PWA: Refresh token guardado, expira en: ${refreshExpiresIn} (${new Date(refreshExpiryTime).toLocaleString()})`);
        }
      } else {
        setToStorage('hasRefreshToken', 'false');
      }
      
      console.log(`✅ PWA Login exitoso - AccessToken: ${expiresIn}, RefreshToken: ${hasRefreshToken ? `${refreshExpiresIn}` : 'NO'}`);
      
      return { success: true, data: { token, usuario, expiresIn, refreshExpiresIn, hasRefreshToken } };
      
    } catch (error) {
      console.error('❌ PWA Error en login:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Error desconocido';

        if (status === 401) {
          return { success: false, error: 'Usuario o contraseña incorrectos' };
        } else {
          return { success: false, error: message };
        }
      } else {
        return { success: false, error: 'No se puede conectar con el servidor. Verifique su conexión.' };
      }
    }
  }

  // ✅ LOGOUT MODIFICADO PARA PWA
  async logout() {
    try {
      console.log('👋 PWA: Cerrando sesión...');
      
      // ✅ Intentar logout en backend
      await axiosLogin.post('/auth/logout');
      console.log('✅ PWA: Logout exitoso en backend');
      
    } catch (error) {
      console.error('⚠️ PWA: Error en logout del backend:', error.response?.data?.message || error.message);
    } finally {
      // ✅ Siempre limpiar localStorage
      this.clearLocalStorage();
    }
  }

  // ✅ UTILIDADES MEJORADAS PARA PWA - ADAPTADAS PARA FLETES
  clearLocalStorage() {
    if (!isClient()) return;
    
    removeFromStorage('token');
    removeFromStorage('refreshToken');
    removeFromStorage('usuario'); // ✅ Cambio: usuario en lugar de empleado
    removeFromStorage('tokenExpiry');
    removeFromStorage('hasRefreshToken');
    removeFromStorage('refreshTokenExpiry');
    
    console.log('🧹 PWA: localStorage limpiado completamente');
  }

  clearSessionAndRedirect() {
    this.clearLocalStorage();
    
    if (!isClient()) return;
    
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      if (typeof toast !== 'undefined') {
        toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }
      window.location.href = '/login';
    }
  }

  // ✅ VERIFICACIÓN DE EXPIRACIÓN
  isTokenExpired() {
    if (!isClient()) return false;
    
    const expiry = getFromStorage('tokenExpiry');
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos de buffer
    
    return (expiryTime - now) < fiveMinutes;
  }

  // ✅ VERIFICAR SI EL REFRESH TOKEN HA EXPIRADO
  isRefreshTokenExpired() {
    if (!isClient()) return true;
    
    const refreshExpiry = getFromStorage('refreshTokenExpiry');
    if (!refreshExpiry) return true;
    
    const expiryTime = parseInt(refreshExpiry);
    const now = Date.now();
    
    return now >= expiryTime;
  }

  hasToken() {
    if (!isClient()) return false;
    return !!getFromStorage('token');
  }

  hasRefreshToken() {
    if (!isClient()) return false;
    const hasRefresh = getFromStorage('hasRefreshToken');
    const refreshToken = getFromStorage('refreshToken');
    return hasRefresh === 'true' && !!refreshToken;
  }

  // ✅ FUNCIÓN DE PARSING MEJORADA para soportar días
  parseExpiration(expiresIn) {
    if (!expiresIn) return 60 * 60 * 1000; // Default 1 hora
    
    // ✅ SOPORTE COMPLETO para horas (h), minutos (m) Y DÍAS (d)
    const match = expiresIn.match(/^(\d+)([hmd])$/);
    if (!match) return 60 * 60 * 1000; // Default 1 hora
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;      // horas a milisegundos
      case 'm': return value * 60 * 1000;           // minutos a milisegundos
      case 'd': return value * 24 * 60 * 60 * 1000; // ✅ días a milisegundos
      default: return 60 * 60 * 1000;               // Default 1 hora
    }
  }

  // ✅ VERIFICACIÓN PERIÓDICA OPTIMIZADA PARA PWA
  startTokenCheck() {
    if (!isClient()) return null;
    
    const interval = setInterval(() => {
      const token = getFromStorage('token');
      const hasRefresh = this.hasRefreshToken();
      
      if (!token) {
        clearInterval(interval);
        return;
      }

      // ✅ PWA: Verificar primero si el refresh token ha expirado
      if (hasRefresh && this.isRefreshTokenExpired()) {
        console.log('⏰ PWA: Refresh token expirado, cerrando sesión...');
        this.clearSessionAndRedirect();
        clearInterval(interval);
        return;
      }

      // ✅ Si el access token está próximo a expirar y tenemos refresh token válido
      if (this.isTokenExpired() && hasRefresh && !this.isRefreshTokenExpired() && !this.isRefreshing) {
        console.log('⏰ PWA: Access token próximo a expirar, renovando...');
        this.handleTokenRefresh({ url: '/auth/health', headers: {} }).catch(() => {
          clearInterval(interval);
        });
      } else if (this.isTokenExpired() && !hasRefresh) {
        console.log('⏰ PWA: Access token expirado sin refresh token, cerrando sesión...');
        this.clearSessionAndRedirect();
        clearInterval(interval);
      }
    }, 30 * 1000); // ✅ Verificar cada 30 segundos

    return interval;
  }

  // ✅ Función auxiliar para obtener usuario - ADAPTADA PARA FLETES
  getUserFromStorage() {
    if (!isClient()) return null;
    
    const usuarioData = getFromStorage('usuario');
    
    if (usuarioData) {
      try {
        const usuario = JSON.parse(usuarioData);
        return usuario;
      } catch (error) {
        console.error('Error parseando datos del usuario:', error);
        return null;
      }
    }
    
    return null;
  }

  // ✅ REFRESH MANUAL MODIFICADO PARA PWA
  async refreshToken() {
    const refreshToken = getFromStorage('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token disponible');
    }

    const response = await axiosLogin.post('/auth/refresh-token', {
      refreshToken: refreshToken
    });
    
    const { accessToken, usuario, expiresIn, refreshTokenExpiresIn } = response.data;
    
    setToStorage('token', accessToken);
    setToStorage('usuario', JSON.stringify(usuario)); // ✅ Cambio: usuario en lugar de empleado
    setToStorage('tokenExpiry', (Date.now() + this.parseExpiration(expiresIn)).toString());
    
    // ✅ Actualizar información del refresh token si está disponible
    if (refreshTokenExpiresIn) {
      setToStorage('refreshTokenExpiry', (Date.now() + (refreshTokenExpiresIn * 1000)).toString());
    }
    
    return accessToken;
  }

  // ✅ FUNCIÓN DE DEBUG MEJORADA PARA PWA
  getAuthDebugInfo() {
    if (!isClient()) return { error: 'No disponible en SSR' };

    const token = getFromStorage('token');
    const refreshToken = getFromStorage('refreshToken');
    const tokenExpiry = getFromStorage('tokenExpiry');
    const hasRefreshToken = getFromStorage('hasRefreshToken') === 'true';
    const refreshTokenExpiry = getFromStorage('refreshTokenExpiry');
    const usuario = this.getUserFromStorage();

    const now = Date.now();
    const tokenExpiryTime = tokenExpiry ? parseInt(tokenExpiry) : null;
    const refreshExpiryTime = refreshTokenExpiry ? parseInt(refreshTokenExpiry) : null;

    // ✅ Detectar si es PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone || 
                  document.referrer.includes('android-app://');

    return {
      // Información de tokens
      hasToken: !!token,
      tokenExpiry: tokenExpiryTime ? new Date(tokenExpiryTime).toLocaleString() : 'N/A',
      tokenExpiresIn: tokenExpiryTime ? Math.max(0, Math.round((tokenExpiryTime - now) / 1000)) : 0,
      isTokenExpired: this.isTokenExpired(),
      
      // Información de refresh token
      hasRefreshToken: hasRefreshToken && !!refreshToken,
      refreshTokenExpiry: refreshExpiryTime ? new Date(refreshExpiryTime).toLocaleString() : 'N/A',
      refreshExpiresIn: refreshExpiryTime ? Math.max(0, Math.round((refreshExpiryTime - now) / 1000)) : 0,
      isRefreshTokenExpired: this.isRefreshTokenExpired(),
      
      // Información del usuario - ADAPTADA PARA FLETES
      user: usuario ? `${usuario.usuario} (ID: ${usuario.id})` : 'N/A',
      isRefreshing: this.isRefreshing,
      
      // ✅ Información específica de PWA
      isPWA,
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
      storageMethod: 'localStorage',
      
      recommendations: this.getAuthRecommendations()
    };
  }

  // ✅ RECOMENDACIONES MEJORADAS PARA PWA
  getAuthRecommendations() {
    const recommendations = [];

    if (!this.hasToken()) {
      recommendations.push('❌ No hay token de acceso - Usuario debe hacer login');
    } else if (this.isTokenExpired()) {
      if (this.hasRefreshToken() && !this.isRefreshTokenExpired()) {
        recommendations.push('🔄 Token expirado pero refresh token válido - Se renovará automáticamente');
      } else if (this.isRefreshTokenExpired()) {
        recommendations.push('⏰ Ambos tokens expirados - Usuario debe hacer login nuevamente');
      } else {
        recommendations.push('❌ Token expirado sin refresh token - Usuario debe hacer login');
      }
    } else {
      const tokenExpiry = getFromStorage('tokenExpiry');
      if (tokenExpiry) {
        const timeLeft = parseInt(tokenExpiry) - Date.now();
        if (timeLeft < 10 * 60 * 1000) { // Menos de 10 minutos
          recommendations.push('⚠️ Token expira pronto - Se renovará automáticamente si hay refresh token');
        } else {
          recommendations.push('✅ Autenticación válida y estable');
        }
      }
    }

    // ✅ Recomendaciones específicas para PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    if (isPWA) {
      recommendations.push('📱 Ejecutándose como PWA - Usando localStorage para persistencia');
      if (this.hasRefreshToken()) {
        recommendations.push('🔑 Refresh token configurado - Sesión persistirá entre suspensiones de PWA');
      }
    }

    return recommendations;
  }

  // ✅ VERIFICAR estado de PWA
  getPWAStatus() {
    if (!isClient()) return { error: 'No disponible en SSR' };

    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const isStandalone = window.navigator.standalone;
    const isAndroidPWA = document.referrer.includes('android-app://');

    return {
      isPWA: isPWA || isStandalone || isAndroidPWA,
      displayMode: isPWA ? 'standalone' : 'browser',
      platform: navigator.userAgent.includes('iPhone') ? 'iOS' : 
                navigator.userAgent.includes('Android') ? 'Android' : 'Desktop',
      standalone: isStandalone,
      androidPWA: isAndroidPWA,
      serviceWorkerReady: 'serviceWorker' in navigator && navigator.serviceWorker.ready,
      storageMethod: 'localStorage',
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine
    };
  }
}

// ✅ Exportar instancia única
export const apiClient = new ApiClient();

// ✅ Funciones helper para compatibilidad con código existente
export const fetchAuth = (endpoint, options) => apiClient.fetchWithAuth(endpoint, options);