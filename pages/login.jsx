import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import { useAuthContext } from '../components/AuthProvider';

// ===== HELPER PARA SSR =====
const isClient = () => typeof window !== 'undefined';

export default function Login() {
  const router = useRouter();
  const { login: authLogin, loading: authLoading } = useAuthContext();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Verificar si ya está logueado (solo en cliente)
    if (isClient()) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('🔄 Usuario ya logueado, redirigiendo...');
        router.push('/inicio');
      }
    }
  }, [router]);

  // No renderizar hasta que esté montado en el cliente
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <Head>
          <title>SISTEMA DE FLETES | INICIAR SESIÓN</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-4 text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  // ===== VALIDACIÓN DEL FORMULARIO =====
  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 4) {
      newErrors.password = 'La contraseña debe tener al menos 4 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== LIMPIAR ERRORES AL ESCRIBIR =====
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  // ===== FUNCIÓN DE LOGIN =====
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await authLogin({
        username: username.trim(),
        password,
        remember
      });

      if (result.success) {
        // El hook useAuthContext ya maneja el toast y redirección
        router.push('/inicio');
      } else {
        toast.error(result.error);
      }

    } catch (error) {
      console.error('❌ Error inesperado en login:', error);
      toast.error('Error inesperado. Inténtelo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // ===== PROBAR CONEXIÓN =====
  const handleTestConnection = async () => {
    if (!isClient()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      
      if (response.ok) {
        toast.success('✅ Conexión exitosa con el servidor');
      } else {
        toast.error('❌ El servidor responde pero hay un error');
      }
    } catch (error) {
      toast.error('❌ Error de conexión: No se puede conectar al servidor');
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== MANEJAR ENTER =====
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && !authLoading && isFormValid) {
      handleLogin();
    }
  };

  // ===== VALIDACIÓN DE FORMULARIO =====
  const isFormValid = username.trim().length >= 3 && password.trim().length >= 4;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <Head>
        <title>SISTEMA DE FLETES | INICIAR SESIÓN</title>
        <meta name="description" content="Sistema de gestión de fletes - Acceso seguro" />
      </Head>
      
      {/* Left Form Container */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-orange-100 rounded-full opacity-50 -translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-50 translate-x-16 translate-y-16"></div>
        
        <div className="w-full max-w-sm space-y-6 relative z-10">
          
          {/* Header con branding de fletes */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-full shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01"/>
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-orange-600 mb-1">SISTEMA DE FLETES</h1>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-500 text-sm">
              Gestión integral de camiones y viajes
            </p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            
            {/* Campo Usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  type="text"
                  className={`block w-full rounded-lg border pl-10 pr-3 py-3 shadow-sm transition-all duration-200 ${
                    errors.username 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
                  } focus:ring focus:ring-opacity-50`}
                  value={username}
                  onChange={handleUsernameChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ingrese su usuario"
                  disabled={loading || authLoading}
                  autoComplete="username"
                  autoFocus
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type="password"
                  className={`block w-full rounded-lg border pl-10 pr-3 py-3 shadow-sm transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
                  } focus:ring focus:ring-opacity-50`}
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ingrese su contraseña"
                  disabled={loading || authLoading}
                  autoComplete="current-password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Checkbox Recordar */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading || authLoading}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Mantener sesión iniciada
                <span className="text-xs text-gray-500 block">
                  (Recomendado)
                </span>
              </label>
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              onClick={handleLogin}
              disabled={loading || authLoading || !isFormValid}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading || authLoading || !isFormValid
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
            >
              {loading || authLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ingresando...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  Iniciar Sesión
                </>
              )}
            </button>

            {/* Botón de Test de Conexión */}
            {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={loading || authLoading}
              className="w-full py-2 px-4 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Probando...' : 'Probar Conexión'}
            </button>
            )}

            {/* Información de debugging en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-lg">
                <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
                <p><strong>Usuario de prueba:</strong> marcos / 2025</p>
                <p><strong>Client:</strong> {isClient() ? 'Si' : 'No'}</p>
                <p><strong>Mounted:</strong> {mounted ? 'Si' : 'No'}</p>
                <p><strong>PWA Mode:</strong> {isClient() && window.matchMedia('(display-mode: standalone)').matches ? 'Si' : 'No'}</p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right Image Container - Truck Theme */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white items-center justify-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-12 h-12 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-16 h-16 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-8 h-8 border-4 border-white rounded-full"></div>
        </div>

        <div className="relative z-10 text-center px-8 max-w-md">
          {/* Truck Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-white bg-opacity-20 p-6 rounded-full backdrop-blur-sm">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12h16m-7-4v8"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
            </div>
          </div>

          <h3 className="text-2xl font-semibold mb-3">¡Bienvenido!</h3>
          <h2 className="text-4xl font-bold mb-4 leading-tight">SISTEMA DE FLETES</h2>
          <p className="text-lg text-orange-100 mb-2">
            Control total de tus camiones
          </p>
          <p className="text-orange-100 leading-relaxed">
            Gestiona ingresos, gastos, viajes y mantenimientos de manera simple y eficiente
          </p>
          
          {/* Features badges */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-center text-sm bg-white bg-opacity-10 rounded-full px-4 py-2 backdrop-blur-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4"/>
              </svg>
              Reportes por camión
            </div>
            <div className="flex items-center justify-center text-sm bg-white bg-opacity-10 rounded-full px-4 py-2 backdrop-blur-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4"/>
              </svg>
              Control de gastos
            </div>
            <div className="flex items-center justify-center text-sm bg-white bg-opacity-10 rounded-full px-4 py-2 backdrop-blur-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4"/>
              </svg>
              PWA móvil optimizada
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header cuando no se ve el lado derecho */}
      <div className="md:hidden absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
            <circle cx="7" cy="19" r="2"/>
            <circle cx="17" cy="19" r="2"/>
          </svg>
          <span className="font-bold text-lg">SISTEMA DE FLETES</span>
        </div>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#ea580c',
              color: 'white',
            },
          },
          error: {
            duration: 6000,
            style: {
              background: '#ef4444',
              color: 'white',
            },
          },
        }}
      />
    </div>
  );
}

// No usar layout para la página de login
Login.getLayout = (page) => page;