// pages/reportes.jsx - RESPONSIVE MEJORADO SIN PERDER INFORMACIÓN
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useReportes } from '../hooks/useReportes';
import { toast } from 'react-hot-toast';

export default function Reportes() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // Hook de reportes
  const {
    dashboard,
    reportesCamiones,
    reportesRutas,
    loading: reportesLoading,
    error,
    getDashboard,
    getReportePorCamion,
    getReporteRutas,
    clearError,
    estadisticasRapidas,
    resumenFinanciero
  } = useReportes(false);

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setLoading(false);
    cargarDatos();
  }, [router]);

  // Cargar datos de reportes
  const cargarDatos = async () => {
    try {
      clearError();
      await Promise.all([
        getDashboard(añoSeleccionado, mesSeleccionado),
        getReportePorCamion(añoSeleccionado, mesSeleccionado),
        getReporteRutas(10)
      ]);
    } catch (error) {
      console.error('❌ Error cargando reportes:', error);
      toast.error('Error cargando algunos reportes');
    }
  };

  // Manejar cambio de fecha
  const handleCambioFecha = (nuevoMes, nuevoAño) => {
    setMesSeleccionado(nuevoMes);
    setAñoSeleccionado(nuevoAño);
    setTimeout(() => {
      getDashboard(nuevoAño, nuevoMes);
      getReportePorCamion(nuevoAño, nuevoMes);
    }, 100);
  };

  // Formatear números
  const formatNumber = (number) => {
    if (!number || number === 0) return '0';
    return Math.abs(number).toLocaleString();
  };

  const formatCurrency = (number) => {
    if (!number || number === 0) return '$0';
    return `$${Math.abs(number).toLocaleString()}`;
  };

  const getNombreMes = (mes) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes';
  };

  const getNombreMesCorto = (mes) => {
    const mesesCortos = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return mesesCortos[mes - 1] || 'Mes';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-indigo-800">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <Head>
        <title>REPORTES | SISTEMA DE FLETES</title>
        <meta name="description" content="Estadísticas y reportes del negocio" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header responsive */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-8 shadow-xl">
          {/* Mobile header */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold">REPORTES</h1>
                </div>
              </div>
              <button 
                onClick={cargarDatos}
                disabled={reportesLoading}
                className="bg-white bg-opacity-20 p-2 rounded-lg"
              >
                <svg className={`w-5 h-5 ${reportesLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-indigo-100 text-sm">
                {getNombreMesCorto(mesSeleccionado)} {añoSeleccionado}
              </p>
              <div className="flex space-x-1">
                <select 
                  value={mesSeleccionado}
                  onChange={(e) => handleCambioFecha(parseInt(e.target.value), añoSeleccionado)}
                  className="bg-white bg-opacity-90 text-indigo-800 px-2 py-1 rounded text-xs font-medium"
                  disabled={reportesLoading}
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{getNombreMesCorto(i+1)}</option>
                  ))}
                </select>
                <select 
                  value={añoSeleccionado}
                  onChange={(e) => handleCambioFecha(mesSeleccionado, parseInt(e.target.value))}
                  className="bg-white bg-opacity-90 text-indigo-800 px-2 py-1 rounded text-xs font-medium"
                  disabled={reportesLoading}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 lg:w-10 h-8 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">REPORTES</h1>
                <p className="text-indigo-100">
                  Estadísticas de {getNombreMes(mesSeleccionado)} {añoSeleccionado}
                </p>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex space-x-2">
                <select 
                  value={mesSeleccionado}
                  onChange={(e) => handleCambioFecha(parseInt(e.target.value), añoSeleccionado)}
                  className="bg-white bg-opacity-90 text-indigo-800 px-3 py-1 rounded text-sm font-medium"
                  disabled={reportesLoading}
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{getNombreMes(i+1)}</option>
                  ))}
                </select>
                <select 
                  value={añoSeleccionado}
                  onChange={(e) => handleCambioFecha(mesSeleccionado, parseInt(e.target.value))}
                  className="bg-white bg-opacity-90 text-indigo-800 px-3 py-1 rounded text-sm font-medium"
                  disabled={reportesLoading}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span className="text-red-800 text-sm sm:text-base">{error}</span>
              </div>
              <button 
                onClick={cargarDatos}
                className="text-red-600 hover:text-red-800 font-medium text-sm ml-2 flex-shrink-0"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {reportesLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 mx-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-indigo-600"></div>
              <span className="text-gray-800 text-sm sm:text-base">Actualizando reportes...</span>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-8">
          {/* Viajes del mes */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-green-500 col-span-1">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    <span className="sm:hidden">Viajes</span>
                    <span className="hidden sm:inline">Viajes en {getNombreMesCorto(mesSeleccionado)}</span>
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
                    {estadisticasRapidas?.viajes_mes || 0}
                  </p>
                  <p className="text-xs text-green-500 hidden sm:block">
                    {estadisticasRapidas?.variacion_viajes 
                      ? `${estadisticasRapidas.variacion_viajes > 0 ? '+' : ''}${estadisticasRapidas.variacion_viajes}% vs anterior`
                      : 'Sin datos anterior'
                    }
                  </p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-full hidden sm:block">
                  <svg className="w-5 h-5 sm:w-6 lg:w-8 h-6 lg:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                  </svg>
                </div>
              </div>
              {/* Mostrar variación en móvil abajo */}
              <p className="text-xs text-green-500 sm:hidden mt-1">
                {estadisticasRapidas?.variacion_viajes 
                  ? `${estadisticasRapidas.variacion_viajes > 0 ? '+' : ''}${estadisticasRapidas.variacion_viajes}%`
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          {/* Kilómetros */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-blue-500 col-span-1">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Km recorridos
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                    {formatNumber(estadisticasRapidas?.km_recorridos || 0)}
                  </p>
                  <p className="text-xs text-blue-500">
                    <span className="sm:hidden">{getNombreMesCorto(mesSeleccionado)}</span>
                    <span className="hidden sm:inline">{getNombreMesCorto(mesSeleccionado)} {añoSeleccionado}</span>
                  </p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full hidden sm:block">
                  <svg className="w-5 h-5 sm:w-6 lg:w-8 h-6 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Ganancia por viaje */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-purple-500 col-span-1">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    <span className="sm:hidden">Ganancia</span>
                    <span className="hidden sm:inline">Ganancia por viaje</span>
                  </p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-600">
                    {formatCurrency(estadisticasRapidas?.ganancia_promedio || 0)}
                  </p>
                  <p className="text-xs text-purple-500">
                    <span className="sm:hidden">Promedio</span>
                    <span className="hidden sm:inline">Promedio {getNombreMesCorto(mesSeleccionado).toLowerCase()}</span>
                  </p>
                </div>
                <div className="bg-purple-100 p-2 sm:p-3 rounded-full hidden sm:block">
                  <svg className="w-5 h-5 sm:w-6 lg:w-8 h-6 lg:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Rendimiento combustible */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-orange-500 col-span-1">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Km por litro
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">
                    {estadisticasRapidas?.rendimiento_combustible || 6.2}
                  </p>
                  <p className="text-xs text-orange-500">
                    <span className="sm:hidden">Flota</span>
                    <span className="hidden sm:inline">Promedio flota</span>
                  </p>
                </div>
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full hidden sm:block">
                  <svg className="w-5 h-5 sm:w-6 lg:w-8 h-6 lg:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opciones de reportes - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-8">
          
          {/* Reporte mensual */}
          <Link href="/reportes/mensual" className="block">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-indigo-500 cursor-pointer group">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-gradient-to-r from-indigo-100 to-indigo-200 p-2 sm:p-3 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 sm:w-7 lg:w-8 sm:h-7 lg:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 ml-3">
                  <span className="sm:hidden">MENSUAL</span>
                  <span className="hidden sm:inline">REPORTE MENSUAL</span>
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                <span className="sm:hidden">Resumen del mes</span>
                <span className="hidden sm:inline">Resumen completo del mes actual</span>
              </p>
            </div>
          </Link>

          {/* Por camión */}
          <Link href="/reportes/por-camion" className="block">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-blue-500 cursor-pointer group">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 sm:p-3 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 sm:w-7 lg:w-8 sm:h-7 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                    <circle cx="7" cy="19" r="2"/>
                    <circle cx="17" cy="19" r="2"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 ml-3">POR CAMIÓN</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                <span className="sm:hidden">Rendimiento individual</span>
                <span className="hidden sm:inline">Rendimiento individual de cada camión</span>
              </p>
            </div>
          </Link>

          {/* Rutas */}
          <Link href="/reportes/rutas" className="block">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-green-500 cursor-pointer group sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-gradient-to-r from-green-100 to-green-200 p-2 sm:p-3 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 sm:w-7 lg:w-8 sm:h-7 lg:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 ml-3">
                  <span className="sm:hidden">RUTAS RENTABLES</span>
                  <span className="hidden sm:inline">RUTAS MÁS RENTABLES</span>
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                <span className="sm:hidden">Análisis por destino</span>
                <span className="hidden sm:inline">Análisis de rentabilidad por destino</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Gráfico financiero - Responsive mejorado */}
        {resumenFinanciero && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span>
                  <span className="sm:hidden">Resumen - {getNombreMesCorto(mesSeleccionado)}</span>
                  <span className="hidden sm:inline">Ingresos vs Gastos - {getNombreMes(mesSeleccionado)} {añoSeleccionado}</span>
                </span>
              </h2>
              
              <button
                onClick={() => setMostrarDetalles(!mostrarDetalles)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium sm:hidden"
              >
                {mostrarDetalles ? 'Ocultar' : 'Ver más'}
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center">
                <div className="w-16 sm:w-20 text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">Ingresos</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 sm:h-8 mx-2 sm:mx-4 relative overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2 sm:pr-4 transition-all duration-1000" 
                    style={{width: `${resumenFinanciero.porcentaje_ingresos}%`}}
                  >
                    <span className="text-white font-medium text-xs sm:text-sm">
                      {formatCurrency(resumenFinanciero.ingresos)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-16 sm:w-20 text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">Gastos</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 sm:h-8 mx-2 sm:mx-4 relative overflow-hidden">
                  <div 
                    className="bg-red-500 h-full rounded-full flex items-center justify-end pr-2 sm:pr-4 transition-all duration-1000" 
                    style={{width: `${resumenFinanciero.porcentaje_gastos}%`}}
                  >
                    <span className="text-white font-medium text-xs sm:text-sm">
                      {formatCurrency(resumenFinanciero.gastos)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-16 sm:w-20 text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">Ganancia</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 sm:h-8 mx-2 sm:mx-4 relative overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2 sm:pr-4 transition-all duration-1000" 
                    style={{width: `${resumenFinanciero.porcentaje_ganancia}%`}}
                  >
                    <span className="text-white font-medium text-xs sm:text-sm">
                      {formatCurrency(resumenFinanciero.ganancia)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rendimiento por camión - Responsive */}
        {reportesCamiones && reportesCamiones.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                  <circle cx="7" cy="19" r="2"/>
                  <circle cx="17" cy="19" r="2"/>
                </svg>
                <span>
                  <span className="sm:hidden">Por Camión</span>
                  <span className="hidden sm:inline">Rendimiento por Camión - {getNombreMes(mesSeleccionado)} {añoSeleccionado}</span>
                </span>
              </h2>
              
              {reportesCamiones.length > 2 && (
                <Link 
                  href="/reportes/por-camion"
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
                >
                  Ver todos ({reportesCamiones.length})
                </Link>
              )}
            </div>
            
            {/* Mobile: Vista compacta en cards verticales */}
            <div className="sm:hidden space-y-3">
              {reportesCamiones.slice(0, 2).map((camion, index) => (
                <div key={camion.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-800">{camion.patente}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      camion.clasificacion === 'Excelente' ? 'bg-green-100 text-green-800' :
                      camion.clasificacion === 'Muy Bueno' ? 'bg-blue-100 text-blue-800' :
                      camion.clasificacion === 'Bueno' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {camion.clasificacion}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Viajes:</span>
                      <span className="font-medium">{camion.viajes_mes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Km:</span>
                      <span className="font-medium">{formatNumber(camion.km_recorridos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ingresos:</span>
                      <span className="font-medium text-green-600 text-xs">{formatCurrency(camion.ingresos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gastos:</span>
                      <span className="font-medium text-red-600 text-xs">{formatCurrency(camion.gastos)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t mt-2">
                    <span className="text-gray-600 font-medium text-xs">Ganancia:</span>
                    <span className="font-bold text-blue-600 text-sm">{formatCurrency(camion.ganancia)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Vista en grid */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-4 lg:gap-6">
              {reportesCamiones.slice(0, 4).map((camion, index) => (
                <div key={camion.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{camion.patente}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      camion.clasificacion === 'Excelente' ? 'bg-green-100 text-green-800' :
                      camion.clasificacion === 'Muy Bueno' ? 'bg-blue-100 text-blue-800' :
                      camion.clasificacion === 'Bueno' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {camion.clasificacion}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Viajes:</span>
                      <span className="font-medium">{camion.viajes_mes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kilómetros:</span>
                      <span className="font-medium">{formatNumber(camion.km_recorridos)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ingresos:</span>
                      <span className="font-medium text-green-600">{formatCurrency(camion.ingresos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gastos:</span>
                      <span className="font-medium text-red-600">{formatCurrency(camion.gastos)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600 font-medium">Ganancia:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(camion.ganancia)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rutas más rentables - Responsive */}
        {reportesRutas && reportesRutas.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
                <span>
                  <span className="sm:hidden">Rutas Top</span>
                  <span className="hidden sm:inline">Rutas Más Rentables</span>
                </span>
              </h2>
              
              {reportesRutas.length > 3 && (
                <Link 
                  href="/reportes/rutas"
                  className="text-green-600 hover:text-green-800 font-medium text-xs sm:text-sm"
                >
                  Ver todas ({reportesRutas.length})
                </Link>
              )}
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {reportesRutas.slice(0, 3).map((ruta, index) => (
                <div 
                  key={ruta.id} 
                  className={`flex items-center justify-between p-3 sm:p-4 border rounded-lg ${
                    index === 0 ? 'bg-green-50 border-green-200' :
                    index === 1 ? 'bg-blue-50 border-blue-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{ruta.nombre}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {ruta.distancia_km} km • {ruta.viajes_completados} viajes
                    </p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className={`font-bold text-sm sm:text-base ${
                      index === 0 ? 'text-green-600' :
                      index === 1 ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {formatCurrency(ruta.ganancia_promedio)}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="sm:hidden">promedio</span>
                      <span className="hidden sm:inline">ganancia promedio</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones rápidas - Responsive */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <Link href="/reportes/mensual" className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4 hover:bg-indigo-100 transition-colors">
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span className="font-medium text-indigo-800 text-xs sm:text-sm text-center sm:text-left">
                  <span className="sm:hidden">Mensual</span>
                  <span className="hidden sm:inline">Reporte Mensual</span>
                </span>
              </div>
            </Link>

            <button 
              onClick={cargarDatos}
              disabled={reportesLoading}
              className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0 ${reportesLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span className="font-medium text-purple-800 text-xs sm:text-sm text-center sm:text-left">
                  {reportesLoading ? 'Cargando...' : 'Actualizar'}
                </span>
              </div>
            </button>

            <Link href="/reportes/por-camion" className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 hover:bg-blue-100 transition-colors">
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span className="font-medium text-blue-800 text-xs sm:text-sm text-center sm:text-left">
                  Por Camión
                </span>
              </div>
            </Link>

            <Link href="/reportes/rutas" className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 hover:bg-green-100 transition-colors">
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
                <span className="font-medium text-green-800 text-xs sm:text-sm text-center sm:text-left">
                  <span className="sm:hidden">Rutas</span>
                  <span className="hidden sm:inline">Rutas Top</span>
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recomendaciones - Responsive optimizada */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            Recomendaciones
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Recomendaciones dinámicas */}
            {resumenFinanciero && resumenFinanciero.ganancia > 0 && estadisticasRapidas?.variacion_viajes > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800 mb-1 text-sm sm:text-base">Excelente desempeño</h4>
                    <p className="text-xs sm:text-sm text-green-700">
                      Tus ganancias aumentaron {estadisticasRapidas.variacion_viajes}% este mes. ¡Sigue así!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {reportesRutas && reportesRutas.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1 text-sm sm:text-base">Optimizar rutas</h4>
                    <p className="text-xs sm:text-sm text-blue-700">
                      <span className="sm:hidden">{reportesRutas[0]?.nombre} es tu ruta más rentable.</span>
                      <span className="hidden sm:inline">{reportesRutas[0]?.nombre} es tu ruta más rentable. Considera incrementar viajes.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {reportesCamiones && reportesCamiones.filter(c => c.clasificacion === 'Malo').length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1 text-sm sm:text-base">Revisar rendimiento</h4>
                    <p className="text-xs sm:text-sm text-yellow-700">
                      El camión {reportesCamiones.find(c => c.clasificacion === 'Malo')?.patente} necesita atención.
                      <span className="hidden sm:inline"> Revisa gastos de mantenimiento.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {estadisticasRapidas?.ganancia_promedio > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800 mb-1 text-sm sm:text-base">Proyección positiva</h4>
                    <p className="text-xs sm:text-sm text-purple-700">
                      <span className="sm:hidden">Puedes generar {formatCurrency(estadisticasRapidas.ganancia_promedio * 1.2)} el próximo mes.</span>
                      <span className="hidden sm:inline">Con este ritmo, puedes generar aproximadamente {formatCurrency(estadisticasRapidas.ganancia_promedio * 1.2)} por viaje el próximo mes.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}