// hooks/useAuth.js - Versión mejorada
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Solo verificar auth si no estamos en la página de login
        if (router.pathname === '/login') {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        // Obtener datos del empleado
        const empleadoData = localStorage.getItem('empleado');
        const role = localStorage.getItem('role');

        if (empleadoData) {
          try {
            const empleado = JSON.parse(empleadoData);
            setUser({
              ...empleado,
              rol: role || empleado.rol // Usar role de localStorage como fallback
            });
          } catch (error) {
            console.error('Error parsing empleado data:', error);
            // Si hay error parseando, crear objeto básico
            setUser({
              nombre: 'Usuario',
              apellido: '',
              usuario: 'unknown',
              rol: role || 'EMPLEADO',
              id: null
            });
          }
        } else {
          // Si no hay datos del empleado, crear objeto básico con el rol
          setUser({
            nombre: 'Usuario',
            apellido: '',
            usuario: 'unknown',
            rol: role || 'EMPLEADO',
            id: null
          });
        }

      } catch (error) {
        console.error('Error en autenticación:', error);
        // Limpiar localStorage en caso de error
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('empleado');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router.pathname]); // Ejecutar cuando cambie la ruta

  // Función para limpiar la sesión
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('empleado');
    setUser(null);
    router.push('/login');
  };

  // Función para verificar si el usuario tiene un rol específico
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

  // Función para verificar si es gerente
  const isManager = () => hasRole('GERENTE');

  // Función para verificar si puede vender
  const canSell = () => hasRole(['GERENTE', 'VENDEDOR']);

  return { 
    user, 
    loading, 
    logout, 
    hasRole, 
    isManager, 
    canSell 
  };
}

// Hook simple para páginas que solo necesitan verificar autenticación
export function useAuthSimple() {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/login') return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router.pathname]);
}