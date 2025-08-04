import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiX, FiMenu, FiHome, FiArrowLeft } from 'react-icons/fi';
import { useAuthContext } from './AuthProvider';

function AppHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { logout } = useAuthContext();

  // ✅ EVITAR HYDRATION MISMATCH
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const usuarioFromStorage = localStorage.getItem("usuario");
      
      if (usuarioFromStorage) {
        try {
          const usuarioData = JSON.parse(usuarioFromStorage);
          setUsuario(usuarioData);
        } catch (error) {
          console.error('Error parsing usuario data:', error);
          setUsuario(null);
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setUsuario(null);
    }
  }, [mounted]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    const handleRouteChange = () => {
      setShowMenu(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const getUserName = () => {
    if (usuario?.usuario) {
      return usuario.usuario;
    }
    return 'Usuario';
  };

  // Función para determinar si mostrar botón de volver
  const shouldShowBackButton = () => {
    const currentPath = router.pathname;
    return currentPath !== '/inicio' && currentPath !== '/';
  };

  // Función para volver atrás
  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/inicio');
    }
  };

  // ✅ NO RENDERIZAR HASTA QUE ESTÉ MONTADO
  if (!mounted) {
    return (
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-2 text-xl sm:text-2xl font-bold">
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
              <circle cx="7" cy="19" r="2"/>
              <circle cx="17" cy="19" r="2"/>
            </svg>
            <span className="hidden sm:inline">SISTEMA DE FLETES</span>
            <span className="sm:hidden">FLETES</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center px-4">
          
          {/* Lado izquierdo: Logo + Botón Volver (si corresponde) */}
          <div className="flex items-center space-x-3">
            {/* Botón volver - Solo en móvil y cuando no estamos en inicio */}
            {shouldShowBackButton() && (
              <button
                onClick={handleGoBack}
                className="sm:hidden bg-white bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-colors"
                title="Volver"
              >
                <FiArrowLeft size={20} />
              </button>
            )}

            {/* Logo */}
            <Link href="/inicio" className="flex items-center space-x-2 text-xl sm:text-2xl font-bold">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
              <span className="hidden sm:inline">SISTEMA DE FLETES</span>
              <span className="sm:hidden">FLETES</span>
            </Link>
          </div>

          {/* Menú hamburguesa para móvil */}
          <div className="sm:hidden">
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Menú horizontal para desktop */}
          <div className="hidden sm:flex items-center space-x-6">
            <Link href="/inicio" className="flex items-center space-x-2 text-white hover:text-orange-200 transition-colors font-medium">
              <FiHome size={18} />
              <span>INICIO</span>
            </Link>
            
            <Link href="/camiones" className="flex items-center space-x-2 text-white hover:text-orange-200 transition-colors font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
              <span>CAMIONES</span>
            </Link>

            <Link href="/viajes" className="flex items-center space-x-2 text-white hover:text-orange-200 transition-colors font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
              </svg>
              <span>VIAJES</span>
            </Link>

            <Link href="/dinero" className="flex items-center space-x-2 text-white hover:text-orange-200 transition-colors font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
              <span>DINERO</span>
            </Link>

            <Link href="/reportes" className="flex items-center space-x-2 text-white hover:text-orange-200 transition-colors font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span>REPORTES</span>
            </Link>
          </div>

          {/* Información del usuario y cerrar sesión - Desktop */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-right text-sm">
              <p className="font-medium">{getUserName()}</p>
              <p className="text-orange-200 text-xs">Transportista</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-white focus:outline-none bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {showMenu && (
          <div className="sm:hidden bg-gradient-to-r from-orange-500 to-orange-600 py-4 px-4">
            {/* Información del usuario en móvil */}
            <div className="bg-orange-600 rounded-lg p-4 mb-4 text-center">
              <p className="font-medium text-white text-lg">{getUserName()}</p>
              <p className="text-orange-200 text-sm">Transportista</p>
            </div>

            {/* Enlaces principales */}
            <div className="space-y-3">
              <Link 
                href="/dinero" 
                className="flex items-center space-x-3 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <span className="text-lg font-medium">DINERO</span>
              </Link>

              <Link 
                href="/reportes" 
                className="flex items-center space-x-3 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span className="text-lg font-medium">REPORTES</span>
              </Link>
            </div>

            {/* Botón de cerrar sesión en móvil */}
            <div className="mt-6 pt-4 border-t border-orange-400">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 text-white py-3 px-4 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default AppHeader;