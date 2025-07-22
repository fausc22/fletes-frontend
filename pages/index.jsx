// pages/index.js - SISTEMA DE FLETES (SIN ERRORES DE HIDRATACIÓN)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // ✅ Evitar hidration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuthAndRedirect = () => {
      try {
        const token = localStorage.getItem('token');
        const usuario = localStorage.getItem('usuario');
        
        console.log('🔍 DEBUG:', { token: !!token, usuario: !!usuario });
        
        if (token && usuario) {
          // Usuario ya logueado - redirigir a inicio
          router.replace('/inicio');
        } else {
          // No logueado - limpiar cualquier dato corrupto y redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('usuario');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('hasRefreshToken');
          localStorage.removeItem('refreshTokenExpiry');
          // ✅ LIMPIAR DATOS ANTIGUOS DE VERTIMAR
          localStorage.removeItem('empleado');
          localStorage.removeItem('role');
          
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error accediendo al localStorage:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router, mounted]);

  // ✅ NO renderizar nada hasta que esté montado
  if (!mounted) {
    return null;
  }

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <Head>
          <title>SISTEMA DE FLETES | Cargando...</title>
        </Head>
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            {/* ✅ SVG Simple sin hydration issues */}
            <div className="w-12 h-12 text-orange-600 animate-pulse bg-orange-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚛</span>
            </div>
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