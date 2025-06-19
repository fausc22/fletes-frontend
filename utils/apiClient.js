import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ===== HELPER FUNCTIONS PARA SSR =====
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

// Instancia de axios para login SIN interceptores
export const axiosLogin = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Instancia de axios autenticado CON interceptores
export const axiosAuth = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
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
    // ===== REQUEST INTERCEPTOR =====
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

    // ===== RESPONSE INTERCEPTOR CON AUTO-RENOVACIÓN =====
    axiosAuth.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si es error 401 y no hemos intentado renovar este request
        if (error.response?.status === 401 && !originalRequest._retry) {
          
          // Si ya estamos renovando, añadir a la cola
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosAuth(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log('🔄 Token expirado, intentando renovar...');
            
            // Intentar renovar token
            const newToken = await this.refreshToken();
            
            if (newToken) {
              console.log('✅ Token renovado exitosamente');
              
              // Procesar cola de requests fallidos
              this.processQueue(null, newToken);
              
              // Reintentar request original
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axiosAuth(originalRequest);
            }
            
          } catch (refreshError) {
            console.log('❌ Error renovando token:', refreshError.message);
            
            // Procesar cola con error
            this.processQueue(refreshError, null);
            
            // Limpiar sesión y redirigir
            this.clearSessionAndRedirect();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Error 403 o cualquier otro error de auth
        if (error.response?.status === 403) {
          console.log('❌ Token inválido o permisos insuficientes');
          this.clearSessionAndRedirect();
        }

        return Promise.reject(error);
      }
    );
  }

  // ===== PROCESAR COLA DE REQUESTS =====
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // ===== RENOVAR TOKEN =====
  async refreshToken() {
    try {
      const response = await axiosLogin.post('/auth/refresh-token');
      const { accessToken, empleado, expiresIn } = response.data;
      
      // Actualizar localStorage
      setToStorage('token', accessToken);
      setToStorage('empleado', JSON.stringify(empleado));
      setToStorage('tokenExpiry', (Date.now() + this.parseExpiration(expiresIn)).toString());
      
      console.log(`✅ Token renovado - Expira en: ${expiresIn}`);
      
      return accessToken;
    } catch (error) {
      console.error('❌ Error en refresh token:', error);
      throw error;
    }
  }

  // ===== LOGIN =====
  async login(credentials) {
    try {
      const response = await axiosLogin.post('/auth/login', credentials);
      const { token, empleado, expiresIn } = response.data;
      
      // Guardar en localStorage
      setToStorage('token', token);
      setToStorage('role', empleado.rol);
      setToStorage('empleado', JSON.stringify(empleado));
      setToStorage('tokenExpiry', (Date.now() + this.parseExpiration(expiresIn)).toString());
      
      console.log(`✅ Login exitoso - Token expira en: ${expiresIn}`);
      
      return { success: true, data: { token, empleado, expiresIn } };
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
        return { success: false, error: 'No se puede conectar con el servidor. Verifique que esté ejecutándose.' };
      }
    }
  }

  // ===== LOGOUT =====
  async logout() {
    try {
      // Llamar logout en el backend para limpiar refresh token
      await axiosLogin.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout del backend:', error);
    } finally {
      // Limpiar localStorage siempre
      this.clearLocalStorage();
    }
  }

  // ===== UTILIDADES =====
  clearLocalStorage() {
    if (!isClient()) return;
    
    removeFromStorage('token');
    removeFromStorage('role');
    removeFromStorage('empleado');
    removeFromStorage('tokenExpiry');
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

  isTokenExpired() {
    if (!isClient()) return false; // En el servidor, asumir que no está expirado
    
    const expiry = getFromStorage('tokenExpiry');
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos en ms
    
    // Considerar expirado si queda menos de 5 minutos
    return (expiryTime - now) < fiveMinutes;
  }

  hasToken() {
    if (!isClient()) return false;
    return !!getFromStorage('token');
  }

  parseExpiration(expiresIn) {
    // Convertir "2h", "15m", etc. a milisegundos
    const match = expiresIn.match(/^(\d+)([hm])$/);
    if (!match) return 15 * 60 * 1000; // Default 15 minutos
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    return unit === 'h' ? value * 60 * 60 * 1000 : value * 60 * 1000;
  }

  // ===== VERIFICACIÓN PERIÓDICA =====
  startTokenCheck() {
    if (!isClient()) return null;
    
    // Verificar cada 2 minutos
    const interval = setInterval(() => {
      const token = getFromStorage('token');
      
      if (!token) {
        clearInterval(interval);
        return;
      }

      if (this.isTokenExpired() && !this.isRefreshing) {
        console.log('⏰ Token próximo a expirar, renovando preventivamente...');
        this.refreshToken().catch(() => {
          clearInterval(interval);
          this.clearSessionAndRedirect();
        });
      }
    }, 2 * 60 * 1000); // 2 minutos

    return interval;
  }

  // ===== WRAPPER PARA FETCH CON AUTH =====
  async fetchWithAuth(endpoint, options = {}) {
    if (!isClient()) {
      throw new Error('fetchWithAuth solo puede usarse en el cliente');
    }
    
    const token = getFromStorage('token');
    
    // Verificar si necesita renovación antes de hacer el request
    if (this.isTokenExpired() && !this.isRefreshing) {
      try {
        await this.refreshToken();
      } catch (error) {
        this.clearSessionAndRedirect();
        throw error;
      }
    }
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      credentials: 'include', // Para enviar cookies
      ...options
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Intentar renovar y reintentar
        try {
          const newToken = await this.refreshToken();
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              'Authorization': `Bearer ${newToken}`
            }
          };
          
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, retryConfig);
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        } catch (refreshError) {
          this.clearSessionAndRedirect();
          throw refreshError;
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== FUNCIONES AUXILIARES PARA HOOKS =====
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
}

// Exportar instancia única
export const apiClient = new ApiClient();

// Funciones helper para compatibilidad
export const fetchAuth = apiClient.fetchWithAuth.bind(apiClient);