// pages/reportes/mensual.jsx - REPORTE MENSUAL COMPLETO
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { useReporteMensual } from '../../hooks/useReporteMensual';
import { toast } from 'react-hot-toast';

export default function ReporteMensual() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
  const [vistaActiva, setVistaActiva] = useState('resumen'); // 'resumen', 'tendencias', 'comparativo'
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  // Hook de reporte mensual
  const {
    reporteMensual,
    mesesComparativos,
    tendencias,
    loading: reporteLoading,
    error,
    getDatosGraficoLineas,
    getDatosGraficoBarras,
    getDatosGraficoCircular,
    getRecomendaciones,
    obtenerNombreMesCompleto,
    obtenerNombreMesCorto,
    getReporteMensual,
    refresh,
    clearError,
    hayDatos,
    totalMeses,
    ingresosTotales,
    gastosTotales,
    balanceAnual,
    promedioViajesMensual
  } = useReporteMensual(false);

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

  // Cargar datos
  const cargarDatos = async () => {
    try {
      clearError();
      await getReporteMensual(añoSeleccionado);
    } catch (error) {
      console.error('❌ Error cargando reporte mensual:', error);
      toast.error('Error cargando reporte mensual');
    }
  };

  // Manejar cambio de año
  const handleCambioAño = (nuevoAño) => {
    setAñoSeleccionado(nuevoAño);
    setTimeout(() => {
      getReporteMensual(nuevoAño);
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

  const formatPercentage = (number) => {
    if (!number || number === 0) return '0%';
    return `${number > 0 ? '+' : ''}${Math.round(number)}%`;
  };

  // Componente de loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-indigo-800">Cargando...</span>
      </div>
    );
  }

  const datosGraficoLineas = getDatosGraficoLineas();
  const datosGraficoBarras = getDatosGraficoBarras();
  const datosGraficoCircular = getDatosGraficoCircular();
  const recomendaciones = getRecomendaciones();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <Head>
        <title>REPORTE MENSUAL | SISTEMA DE FLETES</title>
        <meta name="description" content="Análisis mensual completo del negocio" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header responsive con navegación */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-8 shadow-xl">
          {/* Mobile header */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <Link href="/reportes" className="text-white hover:text-indigo-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </Link>
              <h1 className="text-lg font-bold">REPORTE MENSUAL</h1>
              <button 
                onClick={() => refresh(añoSeleccionado)}
                disabled={reporteLoading}
                className="bg-white bg-opacity-20 p-2 rounded-lg"
              >
                <svg className={`w-5 h-5 ${reporteLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-indigo-100 text-sm">Análisis completo {añoSeleccionado}</p>
              <select 
                value={añoSeleccionado}
                onChange={(e) => handleCambioAño(parseInt(e.target.value))}
                className="bg-white bg-opacity-90 text-indigo-800 px-2 py-1 rounded text-xs font-medium"
                disabled={reporteLoading}
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Link href="/reportes" className="text-white hover:text-indigo-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </Link>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg className="w-8 lg:w-10 h-8 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">REPORTE MENSUAL</h1>
                  <p className="text-indigo-100">
                    Análisis completo del año {añoSeleccionado}
                  </p>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-3 flex items-center space-x-3">
                <select 
                  value={añoSeleccionado}
                  onChange={(e) => handleCambioAño(parseInt(e.target.value))}
                  className="bg-white bg-opacity-90 text-indigo-800 px-3 py-1 rounded text-sm font-medium"
                  disabled={reporteLoading}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
                <button 
                  onClick={() => refresh(añoSeleccionado)}
                  disabled={reporteLoading}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  {reporteLoading ? 'Cargando...' : 'Actualizar'}
                </button>
              </div>
            </div>

            {/* Navegación de pestañas - Desktop */}
            <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
              <button
                onClick={() => setVistaActiva('resumen')}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  vistaActiva === 'resumen' 
                    ? 'bg-white text-indigo-800' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setVistaActiva('tendencias')}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  vistaActiva === 'tendencias' 
                    ? 'bg-white text-indigo-800' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Tendencias
              </button>
              <button
                onClick={() => setVistaActiva('comparativo')}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  vistaActiva === 'comparativo' 
                    ? 'bg-white text-indigo-800' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Comparativo
              </button>
            </div>
          </div>

          {/* Navegación de pestañas - Mobile */}
          <div className="sm:hidden mt-3">
            <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
              <button
                onClick={() => setVistaActiva('resumen')}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  vistaActiva === 'resumen' 
                    ? 'bg-white text-indigo-800' 
                    : 'text-white'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setVistaActiva('tendencias')}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  vistaActiva === 'tendencias' 
                    ? 'bg-white text-indigo-800' 
                    : 'text-white'
                }`}
              >
                Tendencias
              </button>
              <button
                onClick={() => setVistaActiva('comparativo')}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  vistaActiva === 'comparativo' 
                    ? 'bg-white text-indigo-800' 
                    : 'text-white'
                }`}
              >
                Comparativo
              </button>
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
                onClick={() => refresh(añoSeleccionado)}
                className="text-red-600 hover:text-red-800 font-medium text-sm ml-2 flex-shrink-0"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {reporteLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 mx-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-indigo-600"></div>
              <span className="text-gray-800 text-sm sm:text-base">Cargando reporte...</span>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {hayDatos ? (
          <>
            {/* VISTA RESUMEN */}
            {vistaActiva === 'resumen' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Métricas principales */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {/* Ingresos totales */}
                  <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-green-500">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-between">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            <span className="sm:hidden">Ingresos</span>
                            <span className="hidden sm:inline">Ingresos Totales</span>
                          </p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
                            {formatCurrency(ingresosTotales)}
                          </p>
                          <p className="text-xs text-green-500">
                            {totalMeses} meses
                          </p>
                        </div>
                        <div className="bg-green-100 p-2 sm:p-3 rounded-full hidden sm:block">
                          <svg className="w-5 h-5 sm:w-6 lg:w-8 h-6 lg:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gastos totales */}
                  <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-red-500">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-between">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            <span className="sm:hidden">Gastos</span>
                            <span className="hidden sm:inline">Gastos Totales</span>
                          </p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">
                            {formatCurrency(gastosTotales)}
                          </p>
                          <p className="text-xs text-red-500">
                            {totalMeses} meses
                          </p>
                        </div>
                        <div className="bg-red-100 p-2 sm:p-3 rounded-full hidden sm:block">
                          <svg className="w-5 h-5 sm:w-6 lg:w-8 h-6 lg:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Balance anual */}
                  <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-blue-500">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-between">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            <span className="sm:hidden">Ganancia</span>
                            <span className="hidden sm:inline">Balance {añoSeleccionado}</span>
                          </p>
                          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                            balanceAnual >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(balanceAnual)}
                          </p>
                          <p className="text-xs text-blue-500">
                            <span className="sm:hidden">
                              {balanceAnual >= 0 ? 'Positivo' : 'Negativo'}
                            </span>
                            <span className="hidden sm:inline">
                              {balanceAnual >= 0 ? 'Ganancia neta' : 'Pérdida neta'}
                            </span>
                          </p>
                        </div>
                        <div className="bg-blue-100 p-2 sm:p-3 rounded-full hidden sm:block">
                          <svg className="w-5 h-5 sm:w-6 lg:w-8 h-6 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Promedio viajes */}
                  <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-purple-500">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-between">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            <span className="sm:hidden">Viajes/mes</span>
                            <span className="hidden sm:inline">Promedio Viajes/mes</span>
                          </p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">
                            {formatNumber(promedioViajesMensual)}
                          </p>
                          <p className="text-xs text-purple-500">
                            promedio
                          </p>
                        </div>
                        <div className="bg-purple-100 p-2 sm:p-3 rounded-full hidden sm:block">
                          <svg className="w-5 h-5 sm:w-6 lg:w-8 h-6 lg:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gráfico principal - Área temporal */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4"/>
                      </svg>
                      <span>
                        <span className="sm:hidden">Evolución {añoSeleccionado}</span>
                        <span className="hidden sm:inline">Evolución Mensual - {añoSeleccionado}</span>
                      </span>
                    </h2>
                    
                    <button
                      onClick={() => setMostrarDetalle(!mostrarDetalle)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium sm:hidden"
                    >
                      {mostrarDetalle ? 'Ocultar' : 'Detalles'}
                    </button>
                  </div>
                  
                  <div className="h-64 sm:h-80 lg:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={datosGraficoLineas}>
                        <defs>
                          <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                        <XAxis 
                          dataKey="mes" 
                          fontSize={12}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis 
                          fontSize={12}
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => `${(value/1000)}k`}
                        />
                        <Tooltip 
                          formatter={(value, name) => [formatCurrency(value), name === 'ingresos' ? 'Ingresos' : name === 'gastos' ? 'Gastos' : 'Balance']}
                          labelFormatter={(label) => `Mes: ${label}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="ingresos" 
                          stroke="#10B981" 
                          fillOpacity={1} 
                          fill="url(#colorIngresos)"
                          name="Ingresos"
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="gastos" 
                          stroke="#EF4444" 
                          fillOpacity={1} 
                          fill="url(#colorGastos)"
                          name="Gastos"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="balance" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                          name="Balance"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Resumen por mejores y peores meses */}
                {tendencias && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Mejor mes */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 sm:p-6">
                      <div className="flex items-center mb-3 sm:mb-4">
                        <div className="bg-green-500 p-2 sm:p-3 rounded-full">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-green-800 ml-3">
                          <span className="sm:hidden">Mejor Mes</span>
                          <span className="hidden sm:inline">Mejor Mes del Año</span>
                        </h3>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold text-green-700">
                            {obtenerNombreMesCompleto(tendencias.mejorMes.mes)}
                          </p>
                          <p className="text-green-600 text-sm sm:text-base">
                            Ganancia: {formatCurrency(tendencias.mejorMes.balance)}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-600">Ingresos:</span>
                            <p className="font-medium text-green-700">{formatCurrency(tendencias.mejorMes.ingresos)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Viajes:</span>
                            <p className="font-medium text-green-700">{tendencias.mejorMes.viajes}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mes con más atención */}
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 sm:p-6">
                      <div className="flex items-center mb-3 sm:mb-4">
                        <div className="bg-orange-500 p-2 sm:p-3 rounded-full">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                          </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-orange-800 ml-3">
                          <span className="sm:hidden">Requiere Atención</span>
                          <span className="hidden sm:inline">Mes que Requiere Atención</span>
                        </h3>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold text-orange-700">
                            {obtenerNombreMesCompleto(tendencias.peorMes.mes)}
                          </p>
                          <p className="text-orange-600 text-sm sm:text-base">
                            Balance: {formatCurrency(tendencias.peorMes.balance)}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-600">Ingresos:</span>
                            <p className="font-medium text-orange-700">{formatCurrency(tendencias.peorMes.ingresos)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Viajes:</span>
                            <p className="font-medium text-orange-700">{tendencias.peorMes.viajes}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VISTA TENDENCIAS */}
            {vistaActiva === 'tendencias' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Indicadores de tendencia */}
                {tendencias && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">Ingresos</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tendencias.tendenciaIngresos === 'ASCENDENTE' ? 'bg-green-100 text-green-800' :
                          tendencias.tendenciaIngresos === 'DESCENDENTE' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tendencias.tendenciaIngresos}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {formatCurrency(tendencias.promedioIngresosMensual)}
                      </p>
                      <p className="text-sm text-gray-600">Promedio mensual</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">Gastos</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tendencias.tendenciaGastos === 'ASCENDENTE' ? 'bg-red-100 text-red-800' :
                          tendencias.tendenciaGastos === 'DESCENDENTE' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tendencias.tendenciaGastos}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {formatCurrency(tendencias.promedioGastosMensual)}
                      </p>
                      <p className="text-sm text-gray-600">Promedio mensual</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">Balance</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tendencias.tendenciaBalance === 'ASCENDENTE' ? 'bg-green-100 text-green-800' :
                          tendencias.tendenciaBalance === 'DESCENDENTE' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tendencias.tendenciaBalance}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {formatCurrency(tendencias.promedioBalanceMensual)}
                      </p>
                      <p className="text-sm text-gray-600">Promedio mensual</p>
                    </div>
                  </div>
                )}

                {/* Gráfico de líneas temporal */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                      Tendencias Temporales
                    </h2>
                  </div>
                  
                  <div className="h-64 sm:h-80 lg:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={datosGraficoLineas}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                        <XAxis 
                          dataKey="mes" 
                          fontSize={12}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis 
                          fontSize={12}
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => `${(value/1000)}k`}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'viajes' ? `${value} viajes` : formatCurrency(value), 
                            name === 'ingresos' ? 'Ingresos' : name === 'gastos' ? 'Gastos' : name === 'viajes' ? 'Viajes' : 'Balance'
                          ]}
                          labelFormatter={(label) => `Mes: ${label}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }}/>
                        <Line 
                          type="monotone" 
                          dataKey="ingresos" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          name="Ingresos"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="gastos" 
                          stroke="#EF4444" 
                          strokeWidth={3}
                          dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                          name="Gastos"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="balance" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                          name="Balance"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* VISTA COMPARATIVO */}
            {vistaActiva === 'comparativo' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Gráfico de barras comparativo */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                      Comparativo Últimos 6 Meses
                    </h2>
                  </div>
                  
                  <div className="h-64 sm:h-80 lg:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosGraficoBarras}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                        <XAxis 
                          dataKey="mes" 
                          fontSize={12}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis 
                          fontSize={12}
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => `${(value/1000)}k`}
                        />
                        <Tooltip 
                          formatter={(value, name) => [formatCurrency(value), name === 'ingresos' ? 'Ingresos' : 'Gastos']}
                          labelFormatter={(label) => `Mes: ${label}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }}/>
                        <Bar dataKey="ingresos" fill="#10B981" name="Ingresos" radius={[4, 4, 0, 0]}/>
                        <Bar dataKey="gastos" fill="#EF4444" name="Gastos" radius={[4, 4, 0, 0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Distribución anual */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Gráfico circular */}
                  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Distribución Anual
                    </h3>
                    
                    <div className="h-48 sm:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={datosGraficoCircular}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {datosGraficoCircular.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [formatCurrency(value), '']}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '12px' }}
                            formatter={(value, entry) => `${value}: ${entry.payload.porcentaje}%`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Métricas de eficiencia */}
                  {tendencias && (
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Métricas de Eficiencia
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Eficiencia Promedio</span>
                          <span className="font-bold text-lg">
                            {tendencias.eficienciaPromedio}%
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Mes con más viajes</span>
                          <span className="font-bold">
                            {obtenerNombreMesCorto(tendencias.mesConMasViajes.mes)} ({tendencias.mesConMasViajes.viajes})
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Rentabilidad</span>
                          <span className={`font-bold ${balanceAnual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {ingresosTotales > 0 ? Math.round((balanceAnual / ingresosTotales) * 100) : 0}%
                          </span>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Balance Total</span>
                            <span className={`font-bold text-xl ${balanceAnual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(balanceAnual)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {recomendaciones && recomendaciones.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  Recomendaciones
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {recomendaciones.slice(0, 4).map((recomendacion, index) => (
                    <div key={index} className={`border rounded-lg p-3 sm:p-4 ${
                      recomendacion.tipo === 'success' ? 'bg-green-50 border-green-200' :
                      recomendacion.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      recomendacion.tipo === 'danger' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          recomendacion.tipo === 'success' ? 'bg-green-100' :
                          recomendacion.tipo === 'warning' ? 'bg-yellow-100' :
                          recomendacion.tipo === 'danger' ? 'bg-red-100' :
                          'bg-blue-100'
                        }`}>
                          <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            recomendacion.tipo === 'success' ? 'text-green-600' :
                            recomendacion.tipo === 'warning' ? 'text-yellow-600' :
                            recomendacion.tipo === 'danger' ? 'text-red-600' :
                            'text-blue-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {recomendacion.tipo === 'success' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            ) : recomendacion.tipo === 'warning' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            ) : recomendacion.tipo === 'danger' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0