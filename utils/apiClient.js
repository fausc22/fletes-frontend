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
  withCredentials: true, // ✅ IMPORTANTE: Para enviar cookies
});

// ✅ Instancia de axios autenticado CON interceptores
export const axiosAuth = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // ✅ IMPORTANTE: Para enviar cookies
});

class ApiClient {
  constructor() {
    this.baseURL = apiUrl;
    this.isRefreshing = false;
    this.failedQueue = [];
    
    // Solo configurar interceptors en el cliente
    if (isClient()) {
      this.setupInterceptors();
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

    // ✅ RESPONSE INTERCEPTOR - MEJORADO
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

  // ✅ MANEJO MEJORADO DE REFRESH TOKEN
  async handleTokenRefresh(originalRequest) {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, originalRequest });
      });
    }

    this.isRefreshing = true;

    try {
      console.log('🔄 Token expirado, intentando renovar...');
      
      // ✅ USAR axiosLogin para evitar interceptores
      const response = await axiosLogin.post('/auth/refresh-token');
      const { accessToken, empleado, expiresIn, refreshTokenExpiresIn } = response.data;
      
      // ✅ ACTUALIZACIÓN MEJORADA de localStorage con información de refresh token
      setToStorage('token', accessToken);
      setToStorage('empleado', JSON.stringify(empleado));
      setToStorage('tokenExpiry', (Date.now() + this.parseExpiration(expiresIn)).toString());
      
      // ✅ NUEVO: Guardar información del refresh token si está disponible
      if (refreshTokenExpiresIn) {
        setToStorage('refreshTokenExpiry', (Date.now() + (refreshTokenExpiresIn * 1000)).toString());
      }
      
      console.log('✅ Token renovado exitosamente via refresh token');
      
      // ✅ Procesar cola de requests fallidos
      this.processQueue(null, accessToken);
      
      // ✅ Reintentar request original
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosAuth(originalRequest);
      
    } catch (refreshError) {
      console.log('❌ Error renovando token:', refreshError.response?.data?.message || refreshError.message);
      
      // ✅ DEBUGGING MEJORADO para errores de refresh
      if (refreshError.response?.data) {
        const errorData = refreshError.response.data;
        console.log('❌ Detalles del error de refresh:', {
          code: errorData.code,
          message: errorData.message,
          debug: errorData.debug
        });
      }
      
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

  // ✅ LOGIN MEJORADO para manejar refresh tokens
  async login(credentials) {
    try {
      console.log('🔐 Iniciando login con credenciales:', { 
        username: credentials.username, 
        remember: credentials.remember 
      });
      
      const response = await axiosLogin.post('/auth/login', credentials);
      const { token, empleado, expiresIn, refreshExpiresIn, hasRefreshToken } = response.data;
      
      // ✅ GUARDAR EN LOCALSTORAGE CON INFORMACIÓN COMPLETA
      setToStorage('token', token);
      setToStorage('role', empleado.rol);
      setToStorage('empleado', JSON.stringify(empleado));
      setToStorage('tokenExpiry', (Date.now() + this.parseExpiration(expiresIn)).toString());
      
      // ✅ NUEVO: Guardar información del refresh token
      setToStorage('hasRefreshToken', hasRefreshToken.toString());
      
      // ✅ NUEVO: Si tenemos refresh token, calcular y guardar su expiración
      if (hasRefreshToken && refreshExpiresIn) {
        const refreshExpiryTime = Date.now() + this.parseExpiration(refreshExpiresIn);
        setToStorage('refreshTokenExpiry', refreshExpiryTime.toString());
        console.log(`🔑 Refresh token configurado, expira en: ${refreshExpiresIn} (${new Date(refreshExpiryTime).toLocaleString()})`);
      }
      
      console.log(`✅ Login exitoso - AccessToken expira en: ${expiresIn}, RefreshToken: ${hasRefreshToken ? `SÍ (${refreshExpiresIn})` : 'NO'}`);
      
      return { success: true, data: { token, empleado, expiresIn, refreshExpiresIn, hasRefreshToken } };
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      
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

  // ✅ LOGOUT MEJORADO
  async logout() {
    try {
      console.log('👋 Cerrando sesión...');
      
      // ✅ Intentar logout en backend (para limpiar cookie)
      await axiosLogin.post('/auth/logout');
      console.log('✅ Logout exitoso en backend');
      
    } catch (error) {
      console.error('⚠️ Error en logout del backend (continuando con limpieza local):', error.response?.data?.message || error.message);
    } finally {
      // ✅ Siempre limpiar localStorage
      this.clearLocalStorage();
    }
  }

  // ✅ UTILIDADES MEJORADAS
  clearLocalStorage() {
    if (!isClient()) return;
    
    removeFromStorage('token');
    removeFromStorage('role');
    removeFromStorage('empleado');
    removeFromStorage('tokenExpiry');
    removeFromStorage('hasRefreshToken');
    removeFromStorage('refreshTokenExpiry'); // ✅ NUEVO
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

  // ✅ VERIFICACIÓN DE EXPIRACIÓN MEJORADA
  isTokenExpired() {
    if (!isClient()) return false;
    
    const expiry = getFromStorage('tokenExpiry');
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos de buffer
    
    return (expiryTime - now) < fiveMinutes;
  }

  // ✅ NUEVA FUNCIÓN: Verificar si el refresh token ha expirado
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
    return hasRefresh === 'true';
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
      case 'd': return value * 24 * 60 * 60 * 1000; // ✅ NUEVO: días a milisegundos
      default: return 60 * 60 * 1000;               // Default 1 hora
    }
  }

  // ✅ VERIFICACIÓN PERIÓDICA MEJORADA CON LÓGICA DE REFRESH TOKEN
  startTokenCheck() {
    if (!isClient()) return null;
    
    const interval = setInterval(() => {
      const token = getFromStorage('token');
      const hasRefresh = this.hasRefreshToken();
      
      if (!token) {
        clearInterval(interval);
        return;
      }

      // ✅ LÓGICA MEJORADA: Verificar primero si el refresh token ha expirado
      if (hasRefresh && this.isRefreshTokenExpired()) {
        console.log('⏰ Refresh token expirado, cerrando sesión...');
        this.clearSessionAndRedirect();
        clearInterval(interval);
        return;
      }

      // ✅ Si el access token está próximo a expirar y tenemos refresh token válido
      if (this.isTokenExpired() && hasRefresh && !this.isRefreshTokenExpired() && !this.isRefreshing) {
        console.log('⏰ Access token próximo a expirar con refresh token válido, renovando...');
        this.handleTokenRefresh({ url: '/health', headers: {} }).catch(() => {
          clearInterval(interval);
        });
      } else if (this.isTokenExpired() && !hasRefresh) {
        console.log('⏰ Access token expirado sin refresh token, cerrando sesión...');
        this.clearSessionAndRedirect();
        clearInterval(interval);
      }
    }, 30 * 1000); // ✅ OPTIMIZADO: Verificar cada 30 segundos (menos agresivo)

    return interval;
  }

  // ✅ Función auxiliar para obtener usuario
  getUserFromStorage() {
    if (!isClient()) return null;
    
    const empleadoData = getFromStorage('empleado');
    const role = getFromStorage('role');
    
    if (empleadoData) {
      try {
        const empleado = JSON.parse(empleadoData);
        return {
          ...empleado,
          rol: role || empleado.rol
        };
      } catch (error) {
        console.error('Error parseando datos del empleado:', error);
        return null;
      }
    }
    
    return null;
  }

  // ✅ Refresh manual
  async refreshToken() {
    const response = await axiosLogin.post('/auth/refresh-token');
    const { accessToken, empleado, expiresIn, refreshTokenExpiresIn } = response.data;
    
    setToStorage('token', accessToken);
    setToStorage('empleado', JSON.stringify(empleado));
    setToStorage('tokenExpiry', (Date.now() + this.parseExpiration(expiresIn)).toString());
    
    // ✅ NUEVO: Actualizar información del refresh token si está disponible
    if (refreshTokenExpiresIn) {
      setToStorage('refreshTokenExpiry', (Date.now() + (refreshTokenExpiresIn * 1000)).toString());
    }
    
    return accessToken;
  }

  // ✅ WRAPPER PARA FETCH CON AUTH (para compatibilidad)
  async fetchWithAuth(endpoint, options = {}) {
    if (!isClient()) {
      throw new Error('fetchWithAuth solo puede usarse en el cliente');
    }
    
    const token = getFromStorage('token');
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      credentials: 'include',
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // Para errores 401, usar axios que tiene el interceptor configurado
      if (error.message.includes('401')) {
        const axiosResponse = await axiosAuth.get(endpoint);
        return axiosResponse.data;
      }
      throw error;
    }
  }

  // ✅ NUEVA FUNCIÓN: Obtener información de debug del estado de autenticación
  getAuthDebugInfo() {
    if (!isClient()) return { error: 'No disponible en SSR' };

    const token = getFromStorage('token');
    const tokenExpiry = getFromStorage('tokenExpiry');
    const hasRefreshToken = getFromStorage('hasRefreshToken') === 'true';
    const refreshTokenExpiry = getFromStorage('refreshTokenExpiry');
    const empleado = this.getUserFromStorage();

    const now = Date.now();
    const tokenExpiryTime = tokenExpiry ? parseInt(tokenExpiry) : null;
    const refreshExpiryTime = refreshTokenExpiry ? parseInt(refreshTokenExpiry) : null;

    return {
      hasToken: !!token,
      tokenExpiry: tokenExpiryTime ? new Date(tokenExpiryTime).toLocaleString() : 'N/A',
      tokenExpiresIn: tokenExpiryTime ? Math.max(0, Math.round((tokenExpiryTime - now) / 1000)) : 0,
      isTokenExpired: this.isTokenExpired(),
      
      hasRefreshToken,
      refreshTokenExpiry: refreshExpiryTime ? new Date(refreshExpiryTime).toLocaleString() : 'N/A',
      refreshExpiresIn: refreshExpiryTime ? Math.max(0, Math.round((refreshExpiryTime - now) / 1000)) : 0,
      isRefreshTokenExpired: this.isRefreshTokenExpired(),
      
      user: empleado ? `${empleado.nombre} ${empleado.apellido} (${empleado.rol})` : 'N/A',
      isRefreshing: this.isRefreshing,
      
      recommendations: this.getAuthRecommendations()
    };
  }

  // ✅ NUEVA FUNCIÓN: Recomendaciones basadas en el estado
  getAuthRecommendations() {
    const recommendations = [];

    if (!this.hasToken()) {
      recommendations.push('No hay token de acceso - Usuario debe hacer login');
    } else if (this.isTokenExpired()) {
      if (this.hasRefreshToken() && !this.isRefreshTokenExpired()) {
        recommendations.push('Token expirado pero refresh token válido - Se renovará automáticamente');
      } else if (this.isRefreshTokenExpired()) {
        recommendations.push('Ambos tokens expirados - Usuario debe hacer login nuevamente');
      } else {
        recommendations.push('Token expirado sin refresh token - Usuario debe hacer login');
      }
    } else {
      const tokenExpiry = getFromStorage('tokenExpiry');
      if (tokenExpiry) {
        const timeLeft = parseInt(tokenExpiry) - Date.now();
        if (timeLeft < 10 * 60 * 1000) { // Menos de 10 minutos
          recommendations.push('Token expira pronto - Se renovará automáticamente si hay refresh token');
        }
      }
    }

    return recommendations;
  }
}

// ✅ Exportar instancia única
export const apiClient = new ApiClient();

// ✅ Funciones helper para compatibilidad con código existente
export const fetchAuth = (endpoint, options) => apiClient.fetchWithAuth(endpoint, options);