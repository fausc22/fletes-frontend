// pages/reportes/mensual.jsx - REPORTE MENSUAL COMPARATIVO
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useReporteMensual } from '../../hooks/useReporteMensual';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ReporteMensual() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());

  const {
    reporteMensual,
    mesesComparativos,
    tendencias,
    loading,
    error,
    getReporteMensual,
    clearError,
    getDatosGraficoLineas,
    getDatosGraficoBarras,
    getDatosGraficoCircular,
    getRecomendaciones,
    obtenerNombreMes,
    hayDatos,
    ingresosTotales,
    gastosTotales,
    balanceAnual
  } = useReporteMensual(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    cargarDatos();
  }, [mounted, añoSeleccionado]);

  const cargarDatos = async () => {
    await getReporteMensual(añoSeleccionado);
  };

  const formatCurrency = (number) => {
    if (!number || number === 0) return '$0';
    return `$${Math.abs(number).toLocaleString()}`;
  };

  const formatNumber = (number) => {
    if (!number || number === 0) return '0';
    return Math.abs(number).toLocaleString();
  };

  const getTendenciaIcon = (tendencia) => {
    switch (tendencia) {
      case 'ASCENDENTE':
        return <span className="text-green-600">📈</span>;
      case 'DESCENDENTE':
        return <span className="text-red-600">📉</span>;
      case 'ESTABLE':
        return <span className="text-blue-600">➡️</span>;
      default:
        return <span className="text-gray-600">❓</span>;
    }
  };

  const getTendenciaTexto = (tendencia) => {
    switch (tendencia) {
      case 'ASCENDENTE':
        return { texto: 'En crecimiento', color: 'text-green-600' };
      case 'DESCENDENTE':
        return { texto: 'En declive', color: 'text-red-600' };
      case 'ESTABLE':
        return { texto: 'Estable', color: 'text-blue-600' };
      default:
        return { texto: 'Sin datos', color: 'text-gray-600' };
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading && !hayDatos) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-purple-800">Cargando reporte mensual...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6">
      <Head>
        <title>REPORTE MENSUAL | SISTEMA DE FLETES</title>
        <meta name="description" content="Análisis mensual comparativo del negocio" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">REPORTE MENSUAL</h1>
                <p className="text-purple-100">Análisis comparativo - Año {añoSeleccionado}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={añoSeleccionado}
                onChange={(e) => setAñoSeleccionado(parseInt(e.target.value))}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-sm"
                disabled={loading}
              >
                <option value={2024} className="text-gray-800">2024</option>
                <option value={2025} className="text-gray-800">2025</option>
              </select>
              <Link href="/reportes" className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                ← Volver
              </Link>
            </div>
          </div>
        </div>

        {/* Error handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
              <button 
                onClick={cargarDatos}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 mx-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-gray-800">Actualizando datos...</span>
            </div>
          </div>
        )}

        {!hayDatos ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No hay datos disponibles</h3>
            <p className="text-gray-600 mb-8">No se encontraron datos para el año {añoSeleccionado}</p>
            <button
              onClick={cargarDatos}
              className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Recargar Datos
            </button>
          </div>
        ) : (
          <>
            {/* Métricas anuales principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Ingresos Totales</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(ingresosTotales)}</p>
                    <p className="text-sm text-green-500 mt-1">Año {añoSeleccionado}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Gastos Totales</h3>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(gastosTotales)}</p>
                    <p className="text-sm text-red-500 mt-1">Año {añoSeleccionado}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2a3 3 0 003 3h4a3 3 0 003-3z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Balance Anual</h3>
                    <p className={`text-3xl font-bold ${balanceAnual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(balanceAnual)}
                    </p>
                    <p className="text-sm text-blue-500 mt-1">
                      {balanceAnual >= 0 ? 'Ganancia' : 'Pérdida'}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de líneas - Evolución mensual */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Evolución Mensual</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getDatosGraficoLineas()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(value), name === 'ingresos' ? 'Ingresos' : name === 'gastos' ? 'Gastos' : 'Balance']}
                      labelFormatter={(label) => `Mes: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="ingresos" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      name="Ingresos"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gastos" 
                      stroke="#EF4444" 
                      strokeWidth={3} 
                      name="Gastos"
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#3B82F6" 
                      strokeWidth={3} 
                      name="Balance"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Gráfico de barras - Comparativo últimos meses */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Últimos 6 Meses</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDatosGraficoBarras()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value, name) => [formatCurrency(value), name === 'ingresos' ? 'Ingresos' : 'Gastos']}
                      />
                      <Legend />
                      <Bar dataKey="ingresos" fill="#10B981" name="Ingresos" />
                      <Bar dataKey="gastos" fill="#EF4444" name="Gastos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico circular - Distribución anual */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Distribución Anual</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getDatosGraficoCircular()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, porcentaje }) => `${name}: ${porcentaje}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getDatosGraficoCircular().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Análisis de tendencias */}
            {tendencias && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Análisis de Tendencias</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {/* Mejor y peor mes */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">🏆 Mejor Mes</h3>
                    <p className="text-lg font-bold text-green-600">
                      {obtenerNombreMes(tendencias.mejorMes?.mes)}
                    </p>
                    <p className="text-sm text-green-700">
                      {formatCurrency(tendencias.mejorMes?.balance)}
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-2">📉 Peor Mes</h3>
                    <p className="text-lg font-bold text-red-600">
                      {obtenerNombreMes(tendencias.peorMes?.mes)}
                    </p>
                    <p className="text-sm text-red-700">
                      {formatCurrency(tendencias.peorMes?.balance)}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">📊 Promedio Mensual</h3>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(tendencias.promedioBalanceMensual)}
                    </p>
                    <p className="text-sm text-blue-700">Balance promedio</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2">🚛 Más Viajes</h3>
                    <p className="text-lg font-bold text-purple-600">
                      {obtenerNombreMes(tendencias.mesConMasViajes?.mes)}
                    </p>
                    <p className="text-sm text-purple-700">
                      {tendencias.mesConMasViajes?.viajes} viajes
                    </p>
                  </div>
                </div>

                {/* Tendencias por categoría */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-700 mb-2">Tendencia de Ingresos</h4>
                    <div className="flex items-center justify-center space-x-2">
                      {getTendenciaIcon(tendencias.tendenciaIngresos)}
                      <span className={`font-medium ${getTendenciaTexto(tendencias.tendenciaIngresos).color}`}>
                        {getTendenciaTexto(tendencias.tendenciaIngresos).texto}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-semibold text-gray-700 mb-2">Tendencia de Gastos</h4>
                    <div className="flex items-center justify-center space-x-2">
                      {getTendenciaIcon(tendencias.tendenciaGastos)}
                      <span className={`font-medium ${getTendenciaTexto(tendencias.tendenciaGastos).color}`}>
                        {getTendenciaTexto(tendencias.tendenciaGastos).texto}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-semibold text-gray-700 mb-2">Tendencia de Balance</h4>
                    <div className="flex items-center justify-center space-x-2">
                      {getTendenciaIcon(tendencias.tendenciaBalance)}
                      <span className={`font-medium ${getTendenciaTexto(tendencias.tendenciaBalance).color}`}>
                        {getTendenciaTexto(tendencias.tendenciaBalance).texto}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recomendaciones</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getRecomendaciones().map((rec, index) => (
                  <div 
                    key={index}
                    className={`border rounded-lg p-4 ${
                      rec.tipo === 'success' ? 'bg-green-50 border-green-200' :
                      rec.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      rec.tipo === 'danger' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        rec.tipo === 'success' ? 'bg-green-100' :
                        rec.tipo === 'warning' ? 'bg-yellow-100' :
                        rec.tipo === 'danger' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          rec.tipo === 'success' ? 'text-green-600' :
                          rec.tipo === 'warning' ? 'text-yellow-600' :
                          rec.tipo === 'danger' ? 'text-red-600' :
                          'text-blue-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {rec.tipo === 'success' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          )}
                          {rec.tipo === 'warning' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"/>
                          )}
                          {rec.tipo === 'danger' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          )}
                          {rec.tipo === 'info' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          )}
                        </svg>
                      </div>
                      <div>
                        <h3 className={`font-semibold mb-1 ${
                          rec.tipo === 'success' ? 'text-green-800' :
                          rec.tipo === 'warning' ? 'text-yellow-800' :
                          rec.tipo === 'danger' ? 'text-red-800' :
                          'text-blue-800'
                        }`}>
                          {rec.titulo}
                        </h3>
                        <p className={`text-sm ${
                          rec.tipo === 'success' ? 'text-green-700' :
                          rec.tipo === 'warning' ? 'text-yellow-700' :
                          rec.tipo === 'danger' ? 'text-red-700' :
                          'text-blue-700'
                        }`}>
                          {rec.mensaje}
                        </p>
                        {rec.accion && (
                          <p className={`text-xs mt-2 font-medium ${
                            rec.tipo === 'success' ? 'text-green-600' :
                            rec.tipo === 'warning' ? 'text-yellow-600' :
                            rec.tipo === 'danger' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            💡 {rec.accion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}