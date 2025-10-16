import { useState, useEffect } from 'react';
import { useDinero } from '../../hooks/useDinero';
import { useCamiones } from '../../hooks/useCamiones';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';

export default function Balance() {
  const { 
    getIngresos, 
    getGastos, 
    ingresos, 
    gastos,
    loading 
  } = useDinero(false);
  
  const { camiones } = useCamiones();
  
  const [filtros, setFiltros] = useState({
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    camion_id: ''
  });

  const [vistaActiva, setVistaActiva] = useState('resumen'); // 'resumen', 'ingresos', 'gastos'

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    const filtrosAPI = {
      mes: filtros.mes,
      año: filtros.año,
      ...(filtros.camion_id && { camion_id: filtros.camion_id })
    };

    await Promise.all([
      getIngresos(filtrosAPI),
      getGastos(filtrosAPI)
    ]);
  };

  // Cálculos
  const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.total), 0);
  const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.total), 0);
  const balance = totalIngresos - totalGastos;

  const generarPDF = async () => {
  if (ingresos.length === 0 && gastos.length === 0) {
    toast.error('No hay datos para generar el reporte');
    return;
  }

  const toastId = toast.loading('Generando PDF en el servidor...');
  
  try {
    // Construir URL con filtros
    const params = new URLSearchParams();
    if (filtros.mes) params.append('mes', filtros.mes);
    if (filtros.año) params.append('año', filtros.año);
    if (filtros.camion_id) params.append('camion_id', filtros.camion_id);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/dinero/pdf?${params.toString()}`;
    
    console.log('📥 Descargando PDF desde:', url);

    // Obtener el token
    const token = localStorage.getItem('token');

    // Hacer la petición
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al generar el PDF');
    }

    // Obtener el blob del PDF
    const blob = await response.blob();
    
    // Crear URL temporal para descargar
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Reporte_Financiero_${filtros.mes}_${filtros.año}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    toast.dismiss(toastId);
    toast.success('✅ PDF descargado exitosamente');
    
  } catch (error) {
    console.error('❌ Error descargando PDF:', error);
    toast.dismiss(toastId);
    toast.error('Error al generar el PDF');
  }
};

  // Obtener nombre del mes
  const getNombreMes = (numeroMes) => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[numeroMes - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6">
      <Head>
        <title>Balance | Sistema de Fletes</title>
      </Head>

      {/* Header con Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center space-x-3">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span>Balance General</span>
            </h1>
            <p className="text-gray-600">
              {getNombreMes(filtros.mes)} {filtros.año}
              {filtros.camion_id && ` - ${camiones?.find(c => c.id == filtros.camion_id)?.patente || 'Camión'}`}
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <button
              onClick={generarPDF}
              disabled={loading || (ingresos.length === 0 && gastos.length === 0)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
            <select
              value={filtros.mes}
              onChange={(e) => setFiltros({...filtros, mes: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {getNombreMes(i + 1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select
              value={filtros.año}
              onChange={(e) => setFiltros({...filtros, año: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2024, 2025, 2026].map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Camión</label>
            <select
              value={filtros.camion_id}
              onChange={(e) => setFiltros({...filtros, camion_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los camiones</option>
              {camiones?.map(c => (
                <option key={c.id} value={c.id}>
                  {c.patente} - {c.marca} {c.modelo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Total Ingresos</h3>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${totalIngresos.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
          <p className="text-sm text-gray-500 mt-2">{ingresos.length} registros</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Total Gastos</h3>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
            </svg>
          </div>
          <p className="text-3xl font-bold text-red-600">
            ${totalGastos.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
          <p className="text-sm text-gray-500 mt-2">{gastos.length} registros</p>
        </div>

        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${balance >= 0 ? 'border-blue-500' : 'border-orange-500'} transform hover:scale-105 transition-transform`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Balance Neto</h3>
            <svg className={`w-8 h-8 ${balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            ${balance.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {balance >= 0 ? 'Ganancia' : 'Pérdida'}
          </p>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setVistaActiva('resumen')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              vistaActiva === 'resumen'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Resumen
          </button>
          <button
            onClick={() => setVistaActiva('ingresos')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              vistaActiva === 'ingresos'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💰 Ingresos ({ingresos.length})
          </button>
          <button
            onClick={() => setVistaActiva('gastos')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              vistaActiva === 'gastos'
                ? 'border-b-2 border-red-500 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💸 Gastos ({gastos.length})
          </button>
        </div>
      </div>

      {/* Vista de Resumen */}
      {vistaActiva === 'resumen' && (
        <div className="space-y-6">
          {/* Gráfico Visual de Comparación */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Comparación Ingresos vs Gastos</h2>
            <div className="space-y-4">
              {/* Barra de Ingresos */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Ingresos</span>
                  <span className="text-sm font-bold text-green-600">
                    ${totalIngresos.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.min((totalIngresos / Math.max(totalIngresos, totalGastos)) * 100, 100)}%` }}
                  >
                    <span className="text-white text-xs font-bold">
                      {totalIngresos > 0 ? Math.round((totalIngresos / Math.max(totalIngresos, totalGastos)) * 100) + '%' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de Gastos */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Gastos</span>
                  <span className="text-sm font-bold text-red-600">
                    ${totalGastos.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-600 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.min((totalGastos / Math.max(totalIngresos, totalGastos)) * 100, 100)}%` }}
                  >
                    <span className="text-white text-xs font-bold">
                      {totalGastos > 0 ? Math.round((totalGastos / Math.max(totalIngresos, totalGastos)) * 100) + '%' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicador de Balance */}
            <div className={`mt-6 p-4 rounded-lg ${balance >= 0 ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {balance >= 0 ? (
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  )}
                  <div>
                    <p className={`text-sm font-medium ${balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                      {balance >= 0 ? '✅ Período rentable' : '⚠️ Período con pérdidas'}
                    </p>
                    <p className={`text-xs ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {balance >= 0 
                        ? 'Los ingresos superan a los gastos' 
                        : 'Los gastos superan a los ingresos'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Diferencia</p>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    ${Math.abs(balance).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dinero/nuevo-ingreso">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Registrar Ingreso</h3>
                    <p className="text-green-100">Agregar nuevo cobro o entrada</p>
                  </div>
                  <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
              </div>
            </Link>

            <Link href="/dinero/nuevo-gasto">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Registrar Gasto</h3>
                    <p className="text-red-100">Agregar nuevo pago o salida</p>
                  </div>
                  <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Tabla de Ingresos */}
      {vistaActiva === 'ingresos' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <span>💰</span>
              <span>Ingresos</span>
            </h2>
            <Link href="/dinero/nuevo-ingreso">
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                + Nuevo Ingreso
              </button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando ingresos...</p>
            </div>
          ) : ingresos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresos.map(ingreso => (
                    <tr key={ingreso.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(ingreso.fecha).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{ingreso.nombre}</p>
                          {ingreso.descripcion && (
                            <p className="text-xs text-gray-500">{ingreso.descripcion}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          {ingreso.categoria_nombre || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                        ${parseFloat(ingreso.total).toLocaleString('es-AR', {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-green-50 font-bold">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right text-gray-700">TOTAL INGRESOS:</td>
                    <td className="px-4 py-3 text-right text-green-600 text-xl">
                      ${totalIngresos.toLocaleString('es-AR', {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
              <p className="text-gray-500 text-lg mb-4">No hay ingresos registrados en este período</p>
              <Link href="/dinero/nuevo-ingreso">
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors">
                  Registrar Primer Ingreso
                </button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tabla de Gastos */}
      {vistaActiva === 'gastos' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <span>💸</span>
              <span>Gastos</span>
            </h2>
            <Link href="/dinero/nuevo-gasto">
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                + Nuevo Gasto
              </button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando gastos...</p>
            </div>
          ) : gastos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map(gasto => (
                    <tr key={gasto.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(gasto.fecha).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{gasto.nombre}</p>
                          {gasto.descripcion && (
                            <p className="text-xs text-gray-500">{gasto.descripcion}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                          {gasto.categoria_nombre || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-red-600 text-lg">
                        ${parseFloat(gasto.total).toLocaleString('es-AR', {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-red-50 font-bold">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right text-gray-700">TOTAL GASTOS:</td>
                    <td className="px-4 py-3 text-right text-red-600 text-xl">
                      ${totalGastos.toLocaleString('es-AR', {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
              </svg>
              <p className="text-gray-500 text-lg mb-4">No hay gastos registrados en este período</p>
              <Link href="/dinero/nuevo-gasto">
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors">
                  Registrar Primer Gasto
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}