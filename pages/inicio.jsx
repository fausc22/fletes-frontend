// pages/inicio.js - SISTEMA DE FLETES
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import InstallButton from '../components/InstallButton';

export default function Inicio() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const usuarioData = localStorage.getItem('usuario');

        if (!token) {
          router.replace('/login');
          return;
        }

        if (usuarioData) {
          try {
            const parsedUsuario = JSON.parse(usuarioData);
            setUsuario(parsedUsuario);
          } catch (error) {
            console.error('Error parsing usuario data:', error);
            // Si hay error parseando, usar datos básicos
            setUsuario({
              usuario: 'Transportista',
              id: 1
            });
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        toast.error('Error verificando autenticación');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-orange-800">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6">
      <Head>
        <title>SISTEMA DE FLETES | INICIO</title>
        <meta name="description" content="Panel principal del sistema de gestión de fletes" />
      </Head>
      
      {/* Header de bienvenida con tema de fletes */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {getGreeting()}, {usuario?.usuario}
              </h1>
              <p className="text-orange-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span>Sistema de Gestión de Fletes</span>
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="mb-3">
              <InstallButton />
            </div>
            <p className="text-orange-100 text-sm">
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Panel de accesos rápidos con tema de fletes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* VIAJES */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-orange-500">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-3 rounded-xl">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 ml-3">Viajes</h3>
          </div>
          <p className="text-gray-600 mb-4">Gestión completa de tus viajes de flete</p>
          <div className="space-y-2">
            <Link href="/viajes/nuevo" className="block text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Nuevo Viaje</span>
            </Link>
            <Link href="/viajes/activos" className="block text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Viajes Activos</span>
            </Link>
            <Link href="/viajes/historial" className="block text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Historial de Viajes</span>
            </Link>
            <Link href="/viajes/planificar" className="block text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Planificar Viaje</span>
            </Link>
          </div>
        </div>

        {/* CAMIONES */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-blue-500">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 ml-3">Camiones</h3>
          </div>
          <p className="text-gray-600 mb-4">Control y gestión de tu flota de camiones</p>
          <div className="space-y-2">
            <Link href="/camiones/lista" className="block text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Mi Flota</span>
            </Link>
            <Link href="/camiones/nuevo" className="block text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Agregar Camión</span>
            </Link>
            <Link href="/camiones/mantenimiento" className="block text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Mantenimientos</span>
            </Link>
            <Link href="/camiones/documentos" className="block text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Documentación</span>
            </Link>
          </div>
        </div>

        {/* INGRESOS */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-green-100 to-green-200 p-3 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 ml-3">Ingresos</h3>
          </div>
          <p className="text-gray-600 mb-4">Registro y control de ingresos por fletes</p>
          <div className="space-y-2">
            <Link href="/ingresos/registrar" className="block text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Registrar Ingreso</span>
            </Link>
            <Link href="/ingresos/historial" className="block text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Historial de Ingresos</span>
            </Link>
            <Link href="/ingresos/por-camion" className="block text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Ingresos por Camión</span>
            </Link>
            <Link href="/ingresos/facturas" className="block text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Facturas Pendientes</span>
            </Link>
          </div>
        </div>

        {/* GASTOS */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-red-100 to-red-200 p-3 rounded-xl">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 ml-3">Gastos</h3>
          </div>
          <p className="text-gray-600 mb-4">Control detallado de todos tus gastos</p>
          <div className="space-y-2">
            <Link href="/gastos/registrar" className="block text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Registrar Gasto</span>
            </Link>
            <Link href="/gastos/historial" className="block text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Historial de Gastos</span>
            </Link>
            <Link href="/gastos/por-categoria" className="block text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Gastos por Categoría</span>
            </Link>
            <Link href="/gastos/combustible" className="block text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Control Combustible</span>
            </Link>
          </div>
        </div>

        {/* RUTAS */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-purple-500">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-3 rounded-xl">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 ml-3">Rutas</h3>
          </div>
          <p className="text-gray-600 mb-4">Gestión de rutas y tramos frecuentes</p>
          <div className="space-y-2">
            <Link href="/rutas/lista" className="block text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Mis Rutas</span>
            </Link>
            <Link href="/rutas/nueva" className="block text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Nueva Ruta</span>
            </Link>
            <Link href="/rutas/calculadora" className="block text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Calculadora de Distancias</span>
            </Link>
            <Link href="/rutas/rentabilidad" className="block text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Rentabilidad por Ruta</span>
            </Link>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-indigo-500">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-indigo-100 to-indigo-200 p-3 rounded-xl">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 ml-3">Estadísticas</h3>
          </div>
          <p className="text-gray-600 mb-4">Análisis y reportes de tu negocio</p>
          <div className="space-y-2">
            <Link href="/estadisticas/dashboard" className="block text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Dashboard General</span>
            </Link>
            <Link href="/estadisticas/mensuales" className="block text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Reportes Mensuales</span>
            </Link>
            <Link href="/estadisticas/por-camion" className="block text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Estadísticas por Camión</span>
            </Link>
            <Link href="/estadisticas/rentabilidad" className="block text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-2">
              <span>•</span><span>Análisis de Rentabilidad</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Información del sistema con tema de fletes */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-orange-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Información del Sistema</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span><strong>Usuario:</strong> {usuario?.usuario || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span><strong>Tipo:</strong> Sistema de Fletes</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span><strong>Modo:</strong> {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches ? 'PWA Instalada' : 'Navegador Web'}</span>
          </div>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl text-center">
          <div className="text-2xl font-bold">2</div>
          <div className="text-sm text-orange-100">Camiones</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-center">
          <div className="text-2xl font-bold">--</div>
          <div className="text-sm text-green-100">Viajes Este Mes</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl text-center">
          <div className="text-2xl font-bold">--</div>
          <div className="text-sm text-blue-100">Rutas Activas</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl text-center">
          <div className="text-2xl font-bold">--</div>
          <div className="text-sm text-purple-100">Km Este Mes</div>
        </div>
      </div>

      {/* Accesos rápidos móvil */}
      <div className="mt-6 md:hidden">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/viajes/nuevo" className="bg-orange-500 text-white p-4 rounded-lg text-center hover:bg-orange-600 transition-colors">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            <div className="text-sm font-medium">Nuevo Viaje</div>
          </Link>
          <Link href="/gastos/registrar" className="bg-red-500 text-white p-4 rounded-lg text-center hover:bg-red-600 transition-colors">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            <div className="text-sm font-medium">Nuevo Gasto</div>
          </Link>
          <Link href="/ingresos/registrar" className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600 transition-colors">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            <div className="text-sm font-medium">Nuevo Ingreso</div>
          </Link>
          <Link href="/estadisticas/dashboard" className="bg-indigo-500 text-white p-4 rounded-lg text-center hover:bg-indigo-600 transition-colors">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <div className="text-sm font-medium">Ver Reportes</div>
          </Link>
        </div>
      </div>
    </div>
  );
}