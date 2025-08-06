// pages/reportes/por-camion.jsx - REPORTE POR CAMIÓN COMPLETO
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { useReporteCamiones } from '../../hooks/useReporteCamiones';
import { toast } from 'react-hot-toast';

export default function ReportePorCamion() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [vistaActiva, setVistaActiva] = useState('ranking'); // 'ranking', 'comparativo', 'detalle'
  const [camionSeleccionado, setCamionSeleccionado] = useState(null);
  const [ordenPor, setOrdenPor] = useState('ganancia'); // 'ganancia', 'ingresos', 'viajes', 'rentabilidad'
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  // Hook de reporte por camiones
  const {
    reportesCamiones,
    rankings,
    comparativo,
    detalleCamion,
    loading: reporteLoading,
    error,
    getReportePorCamiones,
    getDetalleCamion,
    getDatosGraficoRendimiento,
    getDatosGraficoDistribucion,
    getDatosGraficoComparacion,
    compararConPromedio,
    exportarDatos,
    refresh,
    clearError,
    clearDetalle,
    hayDatos,
    totalCamiones,
    mejorCamion,
    peorCamion,
    masViajero,
    masRentable,
    totalFlota
  } = useReporteCamiones(false);

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
      await getReportePorCamiones(añoSeleccionado, mesSeleccionado);
    } catch (error) {
      console.error('❌ Error cargando reporte por camiones:', error);
      toast.error('Error cargando reporte por camiones');
    }
  };

  // Manejar cambio de fecha
  const handleCambioFecha = (nuevoAño, nuevoMes) => {
    setAñoSeleccionado(nuevoAño);
    setMesSeleccionado(nuevoMes);
    setTimeout(() => {
      getReportePorCamiones(nuevoAño, nuevoMes);
    }, 100);
  };

  // Manejar selección de camión para detalle
  const handleSeleccionarCamion = async (camion) => {
    setCamionSeleccionado(camion);
    setVistaActiva('detalle');
    await getDetalleCamion(camion.id, '3m');
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

  // Obtener datos ordenados según selección
  const getCamionesOrdenados = () => {
    if (!reportesCamiones) return [];
    
    const camiones = [...reportesCamiones];
    
    switch (ordenPor) {
      case 'ingresos':
        return camiones.sort((a, b) => b.ingresos - a.ingresos);
      case 'viajes':
        return camiones.sort((a, b) => b.viajes_mes - a.viajes_mes);
      case 'rentabilidad':
        return camiones.sort((a, b) => b.rentabilidad - a.rentabilidad);
      default:
        return camiones.sort((a, b) => b.ganancia - a.ganancia);
    }
  };

  // Componente de loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-blue-800">Cargando...</span>
      </div>
    );
  }

  const camionesOrdenados = getCamionesOrdenados();
  const datosGraficoRendimiento = getDatosGraficoRendimiento();
  const datosGraficoDistribucion = getDatosGraficoDistribucion();
  const datosGraficoComparacion = getDatosGraficoComparacion(ordenPor);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-4 lg:p-6">
      <Head>
        <title>REPORTE POR CAMIÓN | SISTEMA DE FLETES</title>
        <meta name="description" content="Análisis de rendimiento individual por camión" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header responsive con navegación */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-8 shadow-xl">
          {/* Mobile header */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <Link href="/reportes" className="text-white hover:text-blue-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </Link>
              <h1 className="text-lg font-bold">POR CAMIÓN</h1>
              <button 
                onClick={() => refresh(añoSeleccionado, mesSeleccionado)}
                disabled={reporteLoading}
                className="bg-white bg-opacity-20 p-2 rounded-lg"
              >
                <svg className={`w-5 h-5 ${reporteLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <p className="text-blue-100 text-sm">
                {getNombreMesCorto(mesSeleccionado)} {añoSeleccionado}
              </p>
              <div className="flex space-x-1">
                <select 
                  value={mesSeleccionado}
                  onChange={(e) => handleCambioFecha(añoSeleccionado, parseInt(e.target.value))}
                  className="bg-white bg-opacity-90 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                  disabled={reporteLoading}
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{getNombreMesCorto(i+1)}</option>
                  ))}
                </select>
                <select 
                  value={añoSeleccionado}
                  onChange={(e) => handleCambioFecha(parseInt(e.target.value), mesSeleccionado)}
                  className="bg-white bg-opacity-90 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                  disabled={reporteLoading}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>

            {/* Navegación de pestañas - Mobile */}
            <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
              <button
                onClick={() => { setVistaActiva('ranking'); clearDetalle(); }}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  vistaActiva === 'ranking' 
                    ? 'bg-white text-blue-800' 
                    : 'text-white'
                }`}
              >
                Ranking
              </button>
              <button
                onClick={() => { setVistaActiva('comparativo'); clearDetalle(); }}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  vistaActiva === 'comparativo' 
                    ? 'bg-white text-blue-800' 
                    : 'text-white'
                }`}
              >
                Comparar
              </button>
              {camionSeleccionado && (
                <button
                  onClick={() => setVistaActiva('detalle')}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    vistaActiva === 'detalle' 
                      ? 'bg-white text-blue-800' 
                      : 'text-white'
                  }`}
                >
                  Detalle
                </button>
              )}
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Link href="/reportes" className="text-white hover:text-blue-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </Link>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg className="w-8 lg:w-10 h-8 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">REPORTE POR CAMIÓN</h1>
                  <p className="text-blue-100">
                    Análisis individual - {getNombreMes(mesSeleccionado)} {añoSeleccionado}
                  </p>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-3 flex items-center space-x-3">
                <select 
                  value={mesSeleccionado}
                  onChange={(e) => handleCambioFecha(añoSeleccionado, parseInt(e.target.value))}
                  className="bg-white bg-opacity-90 text-blue-800 px-3 py-1 rounded text-sm font-medium"
                  disabled={reporteLoading}
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{getNombreMes(i+1)}</option>
                  ))}
                </select>
                <select 
                  value={añoSeleccionado}
                  onChange={(e) => handleCambioFecha(parseInt(e.target.value), mesSeleccionado)}
                  className="bg-white bg-opacity-90 text-blue-800 px-3 py-1 rounded text-sm font-medium"
                  disabled={reporteLoading}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
                
<button 
                  onClick={() => refresh(añoSeleccionado, mesSeleccionado)}
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
                onClick={() => { setVistaActiva('ranking'); clearDetalle(); }}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  vistaActiva === 'ranking' 
                    ? 'bg-white text-blue-800' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Ranking
              </button>
              <button
                onClick={() => { setVistaActiva('comparativo'); clearDetalle(); }}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  vistaActiva === 'comparativo' 
                    ? 'bg-white text-blue-800' 
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Comparativo
              </button>
              {camionSeleccionado && (
                <button
                  onClick={() => setVistaActiva('detalle')}
                  className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                    vistaActiva === 'detalle' 
                      ? 'bg-white text-blue-800' 
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  Detalle de {camionSeleccionado.patente}
                </button>
              )}
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
                onClick={() => refresh(añoSeleccionado, mesSeleccionado)}
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
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-800 text-sm sm:text-base">Actualizando reporte...</span>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {hayDatos ? (
          <>
            {/* Resumen de la flota */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-8">
              {/* Total camiones */}
              <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-blue-500">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-between">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        <span className="sm:hidden">Camiones</span>
                        <span className="hidden sm:inline">Total Camiones</span>
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                        {totalCamiones}
                      </p>
                      <p className="text-xs text-blue-500">
                        activos
                      </p>
                    </div>
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-full hidden sm:block">
                      <svg className="w-5 h-5 sm:w-6 lg:w-8 h-6 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

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
                        {formatCurrency(totalFlota.ingresos)}
                      </p>
                      <p className="text-xs text-green-500">
                        flota completa
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

              {/* Total viajes */}
              <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-purple-500">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-between">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        <span className="sm:hidden">Viajes</span>
                        <span className="hidden sm:inline">Total Viajes</span>
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">
                        {formatNumber(totalFlota.viajes)}
                      </p>
                      <p className="text-xs text-purple-500">
                        este mes
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

              {/* Ganancia total */}
              <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 border-l-4 border-orange-500">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-between">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        <span className="sm:hidden">Ganancia</span>
                        <span className="hidden sm:inline">Ganancia Total</span>
                      </p>
                      <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                        (totalFlota.ingresos - totalFlota.gastos) >= 0 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(totalFlota.ingresos - totalFlota.gastos)}
                      </p>
                      <p className="text-xs text-orange-500">
                        balance neto
                      </p>
                    </div>
                    <div className="bg-orange-100 p-2 sm:p-3 rounded-full hidden sm:block">
                      <svg className="w-5 h-5 sm:w-6 lg:w-8 h-6 lg:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VISTA RANKING */}
            {vistaActiva === 'ranking' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Controles de ordenación */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                      Ranking de Camiones - {getNombreMes(mesSeleccionado)} {añoSeleccionado}
                    </h2>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Ordenar por:</label>
                      <select 
                        value={ordenPor}
                        onChange={(e) => setOrdenPor(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ganancia">Ganancia</option>
                        <option value="ingresos">Ingresos</option>
                        <option value="viajes">Viajes</option>
                        <option value="rentabilidad">Rentabilidad</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lista de camiones */}
                <div className="space-y-3 sm:space-y-4">
                  {camionesOrdenados.map((camion, index) => (
                    <div 
                      key={camion.id} 
                      className={`bg-white rounded-lg shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all duration-300 ${
                        index === 0 ? 'border-l-4 border-yellow-500' :
                        index === 1 ? 'border-l-4 border-gray-400' :
                        index === 2 ? 'border-l-4 border-orange-500' :
                        'border-l-4 border-gray-200'
                      }`}
                      onClick={() => handleSeleccionarCamion(camion)}
                    >
                      {/* Mobile layout */}
                      <div className="sm:hidden">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-orange-500' :
                              'bg-gray-300 text-gray-700'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">{camion.patente}</h3>
                              <p className="text-xs text-gray-600">{camion.marca} {camion.modelo}</p>
                            </div>
                          </div>
                          
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            camion.clasificacion === 'Excelente' ? 'bg-green-100 text-green-800' :
                            camion.clasificacion === 'Muy Bueno' ? 'bg-blue-100 text-blue-800' :
                            camion.clasificacion === 'Bueno' ? 'bg-yellow-100 text-yellow-800' :
                            camion.clasificacion === 'Regular' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {camion.clasificacion}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
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
                            <span className="font-medium text-green-600">{formatCurrency(camion.ingresos)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gastos:</span>
                            <span className="font-medium text-red-600">{formatCurrency(camion.gastos)}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between pt-3 border-t mt-3">
                          <span className="text-gray-600 font-medium text-sm">Ganancia:</span>
                          <span className="font-bold text-blue-600">{formatCurrency(camion.ganancia)}</span>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden sm:block">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-orange-500' :
                              'bg-gray-300 text-gray-700'
                            }`}>
                              {index + 1}
                            </div>
                            
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{camion.patente}</h3>
                              <p className="text-sm text-gray-600">{camion.marca} {camion.modelo}</p>
                              <span className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded ${
                                camion.clasificacion === 'Excelente' ? 'bg-green-100 text-green-800' :
                                camion.clasificacion === 'Muy Bueno' ? 'bg-blue-100 text-blue-800' :
                                camion.clasificacion === 'Bueno' ? 'bg-yellow-100 text-yellow-800' :
                                camion.clasificacion === 'Regular' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {camion.clasificacion}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-6 text-center">
                            <div>
                              <p className="text-2xl font-bold text-gray-800">{camion.viajes_mes}</p>
                              <p className="text-xs text-gray-600">Viajes</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-600">{formatCurrency(camion.ingresos)}</p>
                              <p className="text-xs text-gray-600">Ingresos</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-red-600">{formatCurrency(camion.gastos)}</p>
                              <p className="text-xs text-gray-600">Gastos</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-blue-600">{formatCurrency(camion.ganancia)}</p>
                              <p className="text-xs text-gray-600">Ganancia</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISTA COMPARATIVO */}
            {vistaActiva === 'comparativo' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Gráfico de rendimiento */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                      Comparativo de Rendimiento
                    </h2>
                  </div>
                  
                  <div className="h-64 sm:h-80 lg:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosGraficoRendimiento}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                        <XAxis 
                          dataKey="patente" 
                          fontSize={12}
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          fontSize={12}
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => `${(value/1000)}k`}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'viajes' ? `${value} viajes` : formatCurrency(value), 
                            name === 'ingresos' ? 'Ingresos' : 
                            name === 'gastos' ? 'Gastos' : 
                            name === 'ganancia' ? 'Ganancia' : 'Viajes'
                          ]}
                          labelFormatter={(label) => `Camión: ${label}`}
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
                        <Bar dataKey="ganancia" fill="#3B82F6" name="Ganancia" radius={[4, 4, 0, 0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Distribución por clasificación */}
                {datosGraficoDistribucion && datosGraficoDistribucion.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Distribución por Clasificación
                      </h3>
                      
                      <div className="h-48 sm:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={datosGraficoDistribucion}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {datosGraficoDistribucion.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value} camiones`, '']}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ fontSize: '12px' }}
                              formatter={(value) => value}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Mejores y peores del mes */}
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Destacados del Mes
                      </h3>
                      
                      <div className="space-y-4">
                        {mejorCamion && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-medium text-orange-800">Necesita Atención</h4>
                                <p className="text-sm text-orange-700">
                                  {peorCamion.patente} - {formatCurrency(peorCamion.ganancia)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VISTA DETALLE */}
            {vistaActiva === 'detalle' && detalleCamion && (
              <div className="space-y-4 sm:space-y-6">
                {/* Header del detalle */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                          Análisis Detallado - {detalleCamion.camion.patente}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {detalleCamion.camion.marca} {detalleCamion.camion.modelo} • {formatNumber(detalleCamion.camion.kilometros)} km
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => { setVistaActiva('ranking'); clearDetalle(); }}
                      className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Volver al ranking
                    </button>
                  </div>
                </div>

                {/* Resumen del camión */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 border-l-4 border-green-500">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Viajes</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        {detalleCamion.resumen.totalViajes}
                      </p>
                      <p className="text-xs text-green-500">últimos 3 meses</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 border-l-4 border-blue-500">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Ingresos</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">
                        {formatCurrency(detalleCamion.resumen.totalIngresos)}
                      </p>
                      <p className="text-xs text-blue-500">período</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 border-l-4 border-purple-500">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        <span className="sm:hidden">Prom/Viaje</span>
                        <span className="hidden sm:inline">Promedio por Viaje</span>
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">
                        {formatCurrency(detalleCamion.resumen.promedioPorViaje)}
                      </p>
                      <p className="text-xs text-purple-500">ganancia</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 border-l-4 border-orange-500">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Km</p>
                      <p className="text-xl sm:text-2xl font-bold text-orange-600">
                        {formatNumber(detalleCamion.resumen.totalKm)}
                      </p>
                      <p className="text-xs text-orange-500">recorridos</p>
                    </div>
                  </div>
                </div>

                {/* Alertas específicas del camión */}
                {detalleCamion.alertas && detalleCamion.alertas.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Alertas y Recomendaciones</h3>
                    
                    <div className="space-y-3">
                      {detalleCamion.alertas.map((alerta, index) => (
                        <div key={index} className={`border rounded-lg p-3 ${
                          alerta.tipo === 'success' ? 'bg-green-50 border-green-200' :
                          alerta.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                          alerta.tipo === 'danger' ? 'bg-red-50 border-red-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              alerta.tipo === 'success' ? 'bg-green-100' :
                              alerta.tipo === 'warning' ? 'bg-yellow-100' :
                              alerta.tipo === 'danger' ? 'bg-red-100' :
                              'bg-blue-100'
                            }`}>
                              <svg className={`w-4 h-4 ${
                                alerta.tipo === 'success' ? 'text-green-600' :
                                alerta.tipo === 'warning' ? 'text-yellow-600' :
                                alerta.tipo === 'danger' ? 'text-red-600' :
                                'text-blue-600'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {alerta.tipo === 'success' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                ) : alerta.tipo === 'warning' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                ) : alerta.tipo === 'danger' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                )}
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                alerta.tipo === 'success' ? 'text-green-800' :
                                alerta.tipo === 'warning' ? 'text-yellow-800' :
                                alerta.tipo === 'danger' ? 'text-red-800' :
                                'text-blue-800'
                              }`}>
                                {alerta.mensaje}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top gastos e ingresos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Top gastos */}
                  {detalleCamion.topGastos && detalleCamion.topGastos.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Principales Gastos</h3>
                      
                      <div className="space-y-3">
                        {detalleCamion.topGastos.slice(0, 5).map((gasto, index) => (
                          <div key={gasto.id} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {gasto.descripcion || gasto.categoria_nombre}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(gasto.fecha).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-sm font-bold text-red-600">
                                {formatCurrency(gasto.total)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top ingresos */}
                  {detalleCamion.topIngresos && detalleCamion.topIngresos.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Principales Ingresos</h3>
                      
                      <div className="space-y-3">
                        {detalleCamion.topIngresos.slice(0, 5).map((ingreso, index) => (
                          <div key={ingreso.id} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {ingreso.descripcion || 'Viaje completado'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(ingreso.fecha).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-sm font-bold text-green-600">
                                {formatCurrency(ingreso.total)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tendencias del camión */}
                {detalleCamion.tendencias && (
                  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Análisis de Tendencias</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          detalleCamion.tendencias.viajes === 'ASCENDENTE' ? 'bg-green-100 text-green-800' :
                          detalleCamion.tendencias.viajes === 'DESCENDENTE' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {detalleCamion.tendencias.viajes === 'ASCENDENTE' ? '↗️' :
                           detalleCamion.tendencias.viajes === 'DESCENDENTE' ? '↘️' : '➡️'}
                          Viajes {detalleCamion.tendencias.viajes}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          detalleCamion.tendencias.ingresos === 'ASCENDENTE' ? 'bg-green-100 text-green-800' :
                          detalleCamion.tendencias.ingresos === 'DESCENDENTE' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {detalleCamion.tendencias.ingresos === 'ASCENDENTE' ? '↗️' :
                           detalleCamion.tendencias.ingresos === 'DESCENDENTE' ? '↘️' : '➡️'}
                          Ingresos {detalleCamion.tendencias.ingresos}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          detalleCamion.tendencias.gastos === 'DESCENDENTE' ? 'bg-green-100 text-green-800' :
                          detalleCamion.tendencias.gastos === 'ASCENDENTE' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {detalleCamion.tendencias.gastos === 'ASCENDENTE' ? '↗️' :
                           detalleCamion.tendencias.gastos === 'DESCENDENTE' ? '↘️' : '➡️'}
                          Gastos {detalleCamion.tendencias.gastos}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Análisis basado en {detalleCamion.tendencias.período}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Acciones rápidas */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    const csvData = exportarDatos('csv');
                    const blob = new Blob([csvData], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `reporte-camiones-${añoSeleccionado}-${mesSeleccionado}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toast.success('Reporte exportado exitosamente');
                  }}
                  className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 hover:bg-green-100 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span className="font-medium text-green-800 text-xs sm:text-sm text-center sm:text-left">
                      Exportar CSV
                    </span>
                  </div>
                </button>

                <button 
                  onClick={() => refresh(añoSeleccionado, mesSeleccionado)}
                  disabled={reporteLoading}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 ${reporteLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <span className="font-medium text-blue-800 text-xs sm:text-sm text-center sm:text-left">
                      {reporteLoading ? 'Cargando...' : 'Actualizar'}
                    </span>
                  </div>
                </button>

                <Link href="/reportes" className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 hover:bg-purple-100 transition-colors">
                  <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    <span className="font-medium text-purple-800 text-xs sm:text-sm text-center sm:text-left">
                      Ver Todos
                    </span>
                  </div>
                </Link>

                <Link href="/reportes/mensual" className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4 hover:bg-indigo-100 transition-colors">
                  <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span className="font-medium text-indigo-800 text-xs sm:text-sm text-center sm:text-left">
                      Mensual
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* Estado vacío */
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay datos para mostrar
              </h3>
              <p className="text-gray-600 mb-6">
                No se encontraron reportes para {getNombreMes(mesSeleccionado)} {añoSeleccionado}. 
                Intenta con un período diferente o verifica que haya camiones registrados.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => refresh(añoSeleccionado, mesSeleccionado)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Actualizar datos
                </button>
                <Link
                  href="/reportes"
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Volver a reportes
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}