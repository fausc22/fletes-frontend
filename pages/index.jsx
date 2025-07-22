// pages/index.js (pantalla de inicio) - SISTEMA DE FLETES
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        const token = localStorage.getItem('token');
        const usuario = localStorage.getItem('usuario'); // ✅ Cambio: usuario en lugar de empleado
        
        if (token && usuario) {
          // Usuario ya logueado - redirigir a inicio
          router.replace('/inicio');
        } else {
          // No logueado - limpiar cualquier dato corrupto y redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken'); // ✅ Agregar: limpiar refresh token
          localStorage.removeItem('usuario'); // ✅ Cambio: usuario en lugar de empleado/role
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('hasRefreshToken');
          localStorage.removeItem('refreshTokenExpiry');
          router.replace('/login');
        }
      } catch (error) {
        // Error accediendo al localStorage - redirigir al login
        console.error('Error accediendo al localStorage:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <Head>
          <title>SISTEMA DE FLETES | Cargando...</title>
        </Head>
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-orange-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
              <circle cx="7" cy="19" r="2"/>
              <circle cx="17" cy="19" r="2"/>
            </svg>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-800 font-medium">Verificando autenticación...</p>
          <p className="text-orange-600 text-sm mt-2">Sistema de Fletes</p>
        </div>
      </div>
    );
  }

  return null; // No renderizar nada después del redirect
}