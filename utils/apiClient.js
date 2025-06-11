import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Instancia de axios para login SIN interceptores
export const axiosLogin = axios.create({
  baseURL: apiUrl,
  
});

// Instancia de axios autenticado CON interceptores
export const axiosAuth = axios.create({
  baseURL: apiUrl,
  
});

class ApiClient {
  constructor() {
    this.baseURL = apiUrl;
    
    // Configurar interceptor de requests SOLO para axiosAuth
    axiosAuth.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Configurar interceptor de responses SOLO para axiosAuth
    axiosAuth.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido - limpiar y redirigir
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('empleado');
          
          const currentPath = window.location.pathname;
          if (currentPath !== '/login') {
            toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Función específica para login SIN interceptores
  async login(credentials) {
    try {
      const response = await axiosLogin.post('/auth/login', credentials);
      return { success: true, data: response.data };
    } catch (error) {
      // Manejar errores específicos del login
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Error desconocido';

        if (status === 401) {
          return { success: false, error: 'Usuario o contraseña incorrectos' };
        } else {
          return { success: false, error: message || 'Error del servidor' };
        }
      } else {
        return { success: false, error: 'No se puede conectar con el servidor. Verifique que esté ejecutándose.' };
      }
    }
  }

  // Wrapper para fetch con autenticación automática
  async fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('empleado');
        
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          window.location.href = '/login';
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

// Exportar instancia única
export const apiClient = new ApiClient();

// Funciones helper para compatibilidad con código existente
export const fetchAuth = apiClient.fetchWithAuth.bind(apiClient);