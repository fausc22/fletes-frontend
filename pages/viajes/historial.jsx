import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useViajes } from '../../hooks/useViajes';
import { useCamiones } from '../../hooks/useCamiones';
import ViajeDetailHistorialModal from '../../components/modals/ViajeDetailHistorialModal';

export default function HistorialViajes() {
  const router = useRouter();
  const { 
    viajes, 
    getViajes, 
    loading: loadingViajes,
    hasNextPage,
    hasPrevPage,
    currentPage,
    totalPages,
    changePage,
    pagination
  } = useViajes(false);
  
  const { getCamiones, camiones } = useCamiones(false);
  
  const [mounted, setMounted] = useState(false);
  const [filtros, setFiltros] = useState({
    estado: 'COMPLETADO',
    camion_id: '',
    mes: '',
    año: new Date().getFullYear().toString(),
    desde: '',
    hasta: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados para el modal
  const [selectedViaje, setSelectedViaje] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
  }, [mounted]);

  const cargarDatos = async () => {
    try {
      await Promise.all([
        getCamiones(),
        getViajes({ ...filtros, limit: 20, offset: 0 })
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const aplicarFiltros = async () => {
    try {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== '')
      );
      await getViajes({ ...filtrosLimpios, limit: 20, offset: 0 });
    } catch (error) {
      console.error('Error aplicando filtros:', error);
    }
  };

  const limpiarFiltros = async () => {
    const filtrosIniciales = {
      estado: 'COMPLETADO',
      camion_id: '',
      mes: '',
      año: new Date().getFullYear().toString(),
      desde: '',
      hasta: ''
    };
    setFiltros(filtrosIniciales);
    await getViajes({ ...filtrosIniciales, limit: 20, offset: 0 });
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const cambiarPagina = async (nuevaPagina) => {
    const nuevoOffset = (nuevaPagina - 1) * 20;
    await changePage(nuevoOffset, filtros);
  };

  const handleVerDetalle = (viaje) => {
    setSelectedViaje(viaje);
    setShowDetailModal(true);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearDuracion = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return 'N/A';
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = Math.abs(fin - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'EN_CURSO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'Completado';
       case 'CANCELADO':
        return 'Cancelado';
      case 'EN_CURSO':
        return 'En Curso';
      default:
        return estado;
    }
  };

  if (!mounted) {
    return null;
  }

  if (loadingViajes && viajes.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-purple-800">Cargando historial...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6">
      <Head>
        <title>HISTORIAL DE VIAJES | SISTEMA DE FLETES</title>
        <meta name="description" content="Historial completo de viajes realizados" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header responsive */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">HISTORIAL DE VIAJES</h1>
                <p className="text-purple-100 text-sm sm:text-base">
                  {pagination.total} viaje{pagination.total !== 1 ? 's' : ''} registrado{pagination.total !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"/>
                </svg>
                <span>Filtros</span>
              </button>
              <Link href="/viajes" className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all text-center">
                ← Volver
              </Link>
            </div>
          </div>
        </div>

        {/* Panel de filtros responsive */}
        {mostrarFiltros && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Filtrar Viajes</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                >
                  <option value="">Todos</option>
                  <option value="COMPLETADO">Completados</option>
                  <option value="CANCELADO">Cancelados</option>
                  <option value="EN_CURSO">En Curso</option>
                </select>
              </div>

              {/* Camión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Camión</label>
                <select
                  value={filtros.camion_id}
                  onChange={(e) => handleFiltroChange('camion_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                >
                  <option value="">Todos</option>
                  {camiones.map(camion => (
                    <option key={camion.id} value={camion.id}>
                      {camion.patente} - {camion.marca}
                    </option>
                  ))}
                </select>
              </div>

              {/* Año */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <select
                  value={filtros.año}
                  onChange={(e) => handleFiltroChange('año', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                >
                  <option value="">Todos</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              {/* Mes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                <select
                  value={filtros.mes}
                  onChange={(e) => handleFiltroChange('mes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                >
                  <option value="">Todos</option>
                  <option value="1">Enero</option>
                  <option value="2">Febrero</option>
                  <option value="3">Marzo</option>
                  <option value="4">Abril</option>
                  <option value="5">Mayo</option>
                  <option value="6">Junio</option>
                  <option value="7">Julio</option>
                  <option value="8">Agosto</option>
                  <option value="9">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </div>

              {/* Fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                <input
                  type="date"
                  value={filtros.desde}
                  onChange={(e) => handleFiltroChange('desde', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                <input
                  type="date"
                  value={filtros.hasta}
                  onChange={(e) => handleFiltroChange('hasta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={aplicarFiltros}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span>Aplicar Filtros</span>
              </button>
              <button
                onClick={limpiarFiltros}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Lista de viajes responsive */}
        {viajes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">No se encontraron viajes</h3>
            <p className="text-gray-600 mb-6 sm:mb-8">Intenta ajustar los filtros o crear un nuevo viaje</p>
            <Link 
              href="/viajes/nuevo" 
              className="bg-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-purple-700 transition-colors text-base sm:text-lg font-medium inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>Crear Primer Viaje</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {viajes.map((viaje) => (
              <div key={viaje.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-4 sm:p-6">
                  {/* Header del viaje responsive */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-3 lg:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                          <circle cx="7" cy="19" r="2"/>
                          <circle cx="17" cy="19" r="2"/>
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-xl font-bold text-gray-800 truncate">
                          {viaje.patente} - {viaje.marca} {viaje.modelo}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 truncate">
                          {viaje.ruta_nombre 
                            ? `${viaje.ruta_nombre} (${viaje.origen} → ${viaje.destino})`
                            : 'Destino personalizado'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${
                        getEstadoColor(viaje.estado)
                      }`}>
                        {getEstadoTexto(viaje.estado)}
                      </span>
                    </div>
                  </div>

                  {/* Información del viaje - Grid responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">Fecha Inicio</h4>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">{formatearFecha(viaje.fecha_inicio)}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">Fecha Fin</h4>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">{formatearFecha(viaje.fecha_fin)}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">Duración</h4>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">
                        {formatearDuracion(viaje.fecha_inicio, viaje.fecha_fin)}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">Km Recorridos</h4>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">
                        {viaje.km_recorridos ? `${viaje.km_recorridos.toLocaleString()} km` : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3 col-span-2 sm:col-span-3 lg:col-span-1">
                      <h4 className="text-xs font-medium text-gray-600 mb-1">ID Viaje</h4>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">#{viaje.id}</p>
                    </div>
                  </div>

                  {/* Observaciones si existen */}
                  {viaje.observaciones && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <h4 className="text-xs font-medium text-blue-800 mb-1">Observaciones:</h4>
                      <p className="text-xs sm:text-sm text-blue-700">{viaje.observaciones}</p>
                    </div>
                  )}

                  {/* Acciones responsive */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pt-4 border-t border-gray-200 space-y-3 lg:space-y-0">
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                      <button 
                        onClick={() => handleVerDetalle(viaje)}
                        className="text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1 text-sm sm:text-base"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        <span>Ver Detalles</span>
                      </button>
                      
                      <Link 
                        href={`/dinero/movimientos?viaje_id=${viaje.id}`}
                        className="text-green-600 hover:text-green-800 font-medium flex items-center space-x-1 text-sm sm:text-base"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                        </svg>
                        <span>Ver Dinero</span>
                      </Link>

                      {viaje.estado === 'EN_CURSO' && (
                        <Link 
                          href={`/viajes/finalizar/${viaje.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 text-sm sm:text-base"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span>Finalizar</span>
                        </Link>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        Creado: {formatearFecha(viaje.fecha_creacion)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación responsive */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700 text-center sm:text-left">
                Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total} viajes
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => cambiarPagina(currentPage - 1)}
                  disabled={!hasPrevPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => cambiarPagina(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => cambiarPagina(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas responsive */}
        {viajes.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Resumen del Historial</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {viajes.filter(v => v.estado === 'COMPLETADO').length}
                </div>
                <div className="text-xs sm:text-sm text-green-700">Completados</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {viajes.filter(v => v.estado === 'CANCELADO').length}
                </div>
                <div className="text-xs sm:text-sm text-red-700">Cancelados</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {viajes.filter(v => v.estado === 'EN_CURSO').length}
                </div>
                <div className="text-xs sm:text-sm text-blue-700">En Curso</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {viajes.reduce((sum, v) => sum + (v.km_recorridos || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-purple-700">Km Totales</div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones rápidas responsive */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/viajes/nuevo" className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 hover:bg-green-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span className="font-medium text-green-800 text-sm sm:text-base">Nuevo Viaje</span>
              </div>
            </Link>

            <Link href="/viajes/activos" className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span className="font-medium text-blue-800 text-sm sm:text-base">Viajes Activos</span>
              </div>
            </Link>

            <Link href="/reportes/viajes" className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 hover:bg-purple-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span className="font-medium text-purple-800 text-sm sm:text-base">Generar Reporte</span>
              </div>
            </Link>

            <Link href="/dinero" className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 hover:bg-orange-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <span className="font-medium text-orange-800 text-sm sm:text-base">Ver Finanzas</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      <ViajeDetailHistorialModal 
        viaje={selectedViaje}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedViaje(null);
        }}
      />
    </div>
  );
}