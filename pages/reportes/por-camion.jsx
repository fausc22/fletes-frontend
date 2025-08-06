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
                  onClick={() => refresh(añoSel