import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiX, FiMenu } from 'react-icons/fi';
import { useAuthContext } from './AuthProvider';

function AppHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [mounted, setMounted] = useState(false); // ✅ NUEVA STATE
  const router = useRouter();
  const { logout } = useAuthContext();

  // ✅ EVITAR HYDRATION MISMATCH
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // ✅ Solo ejecutar cuando esté montado en el cliente
    if (!mounted) return;

    // Obtener datos del usuario adaptado para fletes
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
  }, [mounted]); // ✅ DEPENDENCIA DE mounted

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    const handleRouteChange = () => {
      setShowMenu(false);
      setOpenSubMenu(null);
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
    setOpenSubMenu(null);
  };

  const toggleSubMenu = (menuName) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = () => {
    setShowMenu(false);
    setOpenSubMenu(null);
  };

  const subMenuVariants = {
    open: { opacity: 1, y: 0, display: 'block' },
    closed: { opacity: 0, y: -10, display: 'none' },
  };

  const logoVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
  };

  const menuItemVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const logoutVariants = {
    hover: { scale: 1.1, backgroundColor: 'rgba(255, 0, 0, 0.2)' },
    tap: { scale: 0.9 },
  };

  // Función para obtener el nombre del usuario
  const getUserName = () => {
    if (usuario?.usuario) {
      return usuario.usuario;
    }
    return 'Usuario';
  };

  // Componente personalizado para Link que cierra los menús al hacer clic
  const MenuLink = ({ href, className, children }) => {
    return (
      <Link href={href} className={className} onClick={handleMenuItemClick}>
        {children}
      </Link>
    );
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
          
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-right text-sm">
              <p className="font-medium">Cargando...</p>
              <p className="text-orange-200 text-xs">Transportista</p>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center px-4">
          {/* Logo con tema de fletes */}
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link href="/" className="flex items-center space-x-2 text-xl sm:text-2xl font-bold">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
              <span className="hidden sm:inline">SISTEMA DE FLETES</span>
              <span className="sm:hidden">FLETES</span>
            </Link>
          </motion.div>

          {/* Menú para pantallas pequeñas */}
          <div className="sm:hidden ml-auto">
            <motion.button onClick={toggleMenu} className="text-white focus:outline-none">
              {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>

          {/* Menú para pantallas grandes */}
          <div className="hidden sm:flex flex-grow justify-center space-x-6 items-center">
            
            {/* VIAJES */}
            <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
              <button onClick={() => toggleSubMenu('viajes')} className="text-white focus:outline-none font-bold flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
                <span>VIAJES</span>
              </button>
              <motion.div
                className="absolute top-full left-0 bg-white text-black shadow-lg rounded-md p-2 mt-1 origin-top"
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'viajes' ? 'open' : 'closed'}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ minWidth: '200px' }}
              >
                <MenuLink href="/viajes/nuevo" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Nuevo Viaje</MenuLink>
                <MenuLink href="/viajes/activos" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Viajes Activos</MenuLink>
                <MenuLink href="/viajes/historial" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap border-b border-gray-200">Historial de Viajes</MenuLink>
                <MenuLink href="/viajes/planificar" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Planificar Viaje</MenuLink>
              </motion.div>
            </motion.div>

            {/* CAMIONES */}
            <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
              <button onClick={() => toggleSubMenu('camiones')} className="text-white focus:outline-none font-bold flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                  <circle cx="7" cy="19" r="2"/>
                  <circle cx="17" cy="19" r="2"/>
                </svg>
                <span>CAMIONES</span>
              </button>
              <motion.div
                className="absolute top-full left-0 bg-white text-black shadow-lg rounded-md p-2 mt-1 origin-top"
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'camiones' ? 'open' : 'closed'}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ minWidth: '200px' }}
              >
                <MenuLink href="/camiones/lista" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Mi Flota</MenuLink>
                <MenuLink href="/camiones/nuevo" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Agregar Camión</MenuLink>
                <MenuLink href="/camiones/mantenimiento" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap border-b border-gray-200">Mantenimientos</MenuLink>
                <MenuLink href="/camiones/documentos" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Documentación</MenuLink>
              </motion.div>
            </motion.div>

            {/* INGRESOS */}
            <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
              <button onClick={() => toggleSubMenu('ingresos')} className="text-white focus:outline-none font-bold flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <span>INGRESOS</span>
              </button>
              <motion.div
                className="absolute top-full left-0 bg-white text-black shadow-lg rounded-md p-2 mt-1 origin-top"
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'ingresos' ? 'open' : 'closed'}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ minWidth: '200px' }}
              >
                <MenuLink href="/ingresos/registrar" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Registrar Ingreso</MenuLink>
                <MenuLink href="/ingresos/historial" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Historial de Ingresos</MenuLink>
                <MenuLink href="/ingresos/por-camion" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap border-b border-gray-200">Ingresos por Camión</MenuLink>
                <MenuLink href="/ingresos/facturas" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Facturas Pendientes</MenuLink>
              </motion.div>
            </motion.div>

            {/* GASTOS */}
            <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
              <button onClick={() => toggleSubMenu('gastos')} className="text-white focus:outline-none font-bold flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span>GASTOS</span>
              </button>
              <motion.div
                className="absolute top-full left-0 bg-white text-black shadow-lg rounded-md p-2 mt-1 origin-top"
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'gastos' ? 'open' : 'closed'}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ minWidth: '200px' }}
              >
                <MenuLink href="/gastos/registrar" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Registrar Gasto</MenuLink>
                <MenuLink href="/gastos/historial" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Historial de Gastos</MenuLink>
                <MenuLink href="/gastos/por-categoria" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Gastos por Categoría</MenuLink>
                <MenuLink href="/gastos/por-camion" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap border-b border-gray-200">Gastos por Camión</MenuLink>
                <MenuLink href="/gastos/combustible" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Control Combustible</MenuLink>
              </motion.div>
            </motion.div>

            {/* RUTAS */}
            <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
              <button onClick={() => toggleSubMenu('rutas')} className="text-white focus:outline-none font-bold flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
                <span>RUTAS</span>
              </button>
              <motion.div
                className="absolute top-full left-0 bg-white text-black shadow-lg rounded-md p-2 mt-1 origin-top"
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'rutas' ? 'open' : 'closed'}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ minWidth: '200px' }}
              >
                <MenuLink href="/rutas/lista" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Mis Rutas</MenuLink>
                <MenuLink href="/rutas/nueva" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Nueva Ruta</MenuLink>
                <MenuLink href="/rutas/calculadora" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap border-b border-gray-200">Calculadora de Distancias</MenuLink>
                <MenuLink href="/rutas/rentabilidad" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Rentabilidad por Ruta</MenuLink>
              </motion.div>
            </motion.div>

            {/* ESTADÍSTICAS */}
            <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
              <button onClick={() => toggleSubMenu('estadisticas')} className="text-white focus:outline-none font-bold flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span>ESTADÍSTICAS</span>
              </button>
              <motion.div
                className="absolute top-full left-0 bg-white text-black shadow-lg rounded-md p-2 mt-1 origin-top"
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'estadisticas' ? 'open' : 'closed'}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ minWidth: '200px' }}
              >
                <MenuLink href="/estadisticas/dashboard" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Dashboard General</MenuLink>
                <MenuLink href="/estadisticas/mensuales" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Reportes Mensuales</MenuLink>
                <MenuLink href="/estadisticas/por-camion" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Estadísticas por Camión</MenuLink>
                <MenuLink href="/estadisticas/rentabilidad" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap border-b border-gray-200">Análisis de Rentabilidad</MenuLink>
                <MenuLink href="/estadisticas/exportar" className="block py-2 px-4 hover:bg-orange-50 text-sm whitespace-nowrap">Exportar Datos</MenuLink>
              </motion.div>
            </motion.div>
          </div>

          {/* Información del usuario y cerrar sesión */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-right text-sm">
              <p className="font-medium">{getUserName()}</p>
              <p className="text-orange-200 text-xs">Transportista</p>
            </div>
            
            <motion.button
              onClick={handleLogout}
              className="text-white focus:outline-none bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold transition-colors"
              variants={logoutVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Cerrar Sesión
            </motion.button>
          </div>
        </div>

        {/* Menu para pantallas pequeñas */}
        {showMenu && (
          <div className="sm:hidden bg-gradient-to-r from-orange-500 to-orange-600 py-2 px-4 flex flex-col items-center">
            {/* Información del usuario en móvil */}
            <div className="w-full text-center mb-4 bg-orange-600 rounded-lg p-3">
              <p className="font-medium text-white">{getUserName()}</p>
              <p className="text-orange-200 text-sm">Transportista</p>
            </div>

            {/* VIAJES MÓVIL */}
            <div className="w-full mb-2">
              <motion.button
                onClick={() => toggleSubMenu('viajes-mobile')}
                className="w-full text-white py-2 focus:outline-none text-left font-bold flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
                <span>VIAJES</span>
              </motion.button>
              <motion.div
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'viajes-mobile' ? 'open' : 'closed'}
                className="overflow-hidden"
              >
                <MenuLink href="/viajes/nuevo" className="block py-2 px-4 hover:bg-orange-600 text-white">Nuevo Viaje</MenuLink>
                <MenuLink href="/viajes/activos" className="block py-2 px-4 hover:bg-orange-600 text-white">Viajes Activos</MenuLink>
                <MenuLink href="/viajes/historial" className="block py-2 px-4 hover:bg-orange-600 text-white">Historial</MenuLink>
                <MenuLink href="/viajes/planificar" className="block py-2 px-4 hover:bg-orange-600 text-white">Planificar</MenuLink>
              </motion.div>
            </div>

            {/* CAMIONES MÓVIL */}
            <div className="w-full mb-2">
              <motion.button
                onClick={() => toggleSubMenu('camiones-mobile')}
                className="w-full text-white py-2 focus:outline-none text-left font-bold flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                  <circle cx="7" cy="19" r="2"/>
                  <circle cx="17" cy="19" r="2"/>
                </svg>
                <span>CAMIONES</span>
              </motion.button>
              <motion.div
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'camiones-mobile' ? 'open' : 'closed'}
                className="overflow-hidden"
              >
                <MenuLink href="/camiones/lista" className="block py-2 px-4 hover:bg-orange-600 text-white">Mi Flota</MenuLink>
                <MenuLink href="/camiones/nuevo" className="block py-2 px-4 hover:bg-orange-600 text-white">Agregar</MenuLink>
                <MenuLink href="/camiones/mantenimiento" className="block py-2 px-4 hover:bg-orange-600 text-white">Mantenimiento</MenuLink>
                <MenuLink href="/camiones/documentos" className="block py-2 px-4 hover:bg-orange-600 text-white">Documentos</MenuLink>
              </motion.div>
            </div>

            {/* INGRESOS MÓVIL */}
            <div className="w-full mb-2">
              <motion.button
                onClick={() => toggleSubMenu('ingresos-mobile')}
                className="w-full text-white py-2 focus:outline-none text-left font-bold flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <span>INGRESOS</span>
              </motion.button>
              <motion.div
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'ingresos-mobile' ? 'open' : 'closed'}
                className="overflow-hidden"
              >
                <MenuLink href="/ingresos/registrar" className="block py-2 px-4 hover:bg-orange-600 text-white">Registrar</MenuLink>
                <MenuLink href="/ingresos/historial" className="block py-2 px-4 hover:bg-orange-600 text-white">Historial</MenuLink>
                <MenuLink href="/ingresos/por-camion" className="block py-2 px-4 hover:bg-orange-600 text-white">Por Camión</MenuLink>
                <MenuLink href="/ingresos/facturas" className="block py-2 px-4 hover:bg-orange-600 text-white">Facturas</MenuLink>
              </motion.div>
            </div>

            {/* GASTOS MÓVIL */}
            <div className="w-full mb-2">
              <motion.button
                onClick={() => toggleSubMenu('gastos-mobile')}
                className="w-full text-white py-2 focus:outline-none text-left font-bold flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span>GASTOS</span>
              </motion.button>
              <motion.div
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'gastos-mobile' ? 'open' : 'closed'}
                className="overflow-hidden"
              >
                <MenuLink href="/gastos/registrar" className="block py-2 px-4 hover:bg-orange-600 text-white">Registrar</MenuLink>
                <MenuLink href="/gastos/historial" className="block py-2 px-4 hover:bg-orange-600 text-white">Historial</MenuLink>
                <MenuLink href="/gastos/por-categoria" className="block py-2 px-4 hover:bg-orange-600 text-white">Por Categoría</MenuLink>
                <MenuLink href="/gastos/por-camion" className="block py-2 px-4 hover:bg-orange-600 text-white">Por Camión</MenuLink>
                <MenuLink href="/gastos/combustible" className="block py-2 px-4 hover:bg-orange-600 text-white">Combustible</MenuLink>
              </motion.div>
            </div>

            {/* RUTAS MÓVIL */}
            <div className="w-full mb-2">
              <motion.button
                onClick={() => toggleSubMenu('rutas-mobile')}
                className="w-full text-white py-2 focus:outline-none text-left font-bold flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
                <span>RUTAS</span>
              </motion.button>
              <motion.div
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'rutas-mobile' ? 'open' : 'closed'}
                className="overflow-hidden"
              >
                <MenuLink href="/rutas/lista" className="block py-2 px-4 hover:bg-orange-600 text-white">Mis Rutas</MenuLink>
                <MenuLink href="/rutas/nueva" className="block py-2 px-4 hover:bg-orange-600 text-white">Nueva</MenuLink>
                <MenuLink href="/rutas/calculadora" className="block py-2 px-4 hover:bg-orange-600 text-white">Calculadora</MenuLink>
                <MenuLink href="/rutas/rentabilidad" className="block py-2 px-4 hover:bg-orange-600 text-white">Rentabilidad</MenuLink>
              </motion.div>
            </div>

            {/* ESTADÍSTICAS MÓVIL */}
            <div className="w-full mb-4">
              <motion.button
                onClick={() => toggleSubMenu('estadisticas-mobile')}
                className="w-full text-white py-2 focus:outline-none text-left font-bold flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span>ESTADÍSTICAS</span>
              </motion.button>
              <motion.div
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'estadisticas-mobile' ? 'open' : 'closed'}
                className="overflow-hidden"
              >
                <MenuLink href="/estadisticas/dashboard" className="block py-2 px-4 hover:bg-orange-600 text-white">Dashboard</MenuLink>
                <MenuLink href="/estadisticas/mensuales" className="block py-2 px-4 hover:bg-orange-600 text-white">Mensuales</MenuLink>
                <MenuLink href="/estadisticas/por-camion" className="block py-2 px-4 hover:bg-orange-600 text-white">Por Camión</MenuLink>
                <MenuLink href="/estadisticas/rentabilidad" className="block py-2 px-4 hover:bg-orange-600 text-white">Rentabilidad</MenuLink>
                <MenuLink href="/estadisticas/exportar" className="block py-2 px-4 hover:bg-orange-600 text-white">Exportar</MenuLink>
              </motion.div>
            </div>

            {/* Botón de cerrar sesión en móvil */}
            <motion.button
              onClick={handleLogout}
              className="w-full text-white py-3 focus:outline-none bg-red-500 hover:bg-red-600 rounded-lg font-bold mt-2 flex items-center justify-center space-x-2"
              variants={logoutVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>Cerrar Sesión</span>
            </motion.button>
          </div>
        )}
      </nav>
    </>
  );
}

export default AppHeader;