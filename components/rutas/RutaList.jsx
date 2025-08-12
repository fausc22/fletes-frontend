// components/rutas/RutaList.jsx - SISTEMA DE FLETES - VERSIÓN RESPONSIVE MEJORADA
import { useState } from 'react';
import RutaCard from './RutaCard';

export default function RutaList({ 
  rutas, 
  loading, 
  error, 
  onEdit, 
  onDelete, 
  onRefresh,
  showFilters = true,
  showActions = true 
}) {
  const [filtros, setFiltros] = useState({
    estado: 'todos', // todos, activas, inactivas, populares, nuevas
    busqueda: '',
    ordenPor: 'nombre' // nombre, viajes, rentabilidad, distancia
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filtrar rutas según criterios
  const rutasFiltradas = rutas.filter(ruta => {
    // Filtro por estado
    if (filtros.estado === 'activas' && !ruta.activo) return false;
    if (filtros.estado === 'inactivas' && ruta.activo) return false;
    if (filtros.estado === 'populares' && (ruta.total_viajes || 0) < 5) return false;
    if (filtros.estado === 'nuevas' && (ruta.total_viajes || 0) > 0) return false;

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const coincide = 
        ruta.nombre?.toLowerCase().includes(busqueda) ||
        ruta.origen?.toLowerCase().includes(busqueda) ||
        ruta.destino?.toLowerCase().includes(busqueda);
      
      if (!coincide) return false;
    }

    return true;
  });

  // Ordenar rutas
  const rutasOrdenadas = [...rutasFiltradas].sort((a, b) => {
    switch (filtros.ordenPor) {
      case 'viajes':
        return (b.total_viajes || 0) - (a.total_viajes || 0);
      case 'rentabilidad':
        return (b.promedio_ingresos || 0) - (a.promedio_ingresos || 0);
      case 'distancia':
        return (a.distancia_km || 0) - (b.distancia_km || 0);
      case 'nombre':
      default:
        return (a.nombre || '').localeCompare(b.nombre || '');
    }
  });

  // Manejar cambio de filtros
  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: valor
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      estado: 'todos',
      busqueda: '',
      ordenPor: 'nombre'
    });
  };

  // Obtener estadísticas rápidas
  const getEstadisticas = () => {
    return {
      total: rutas.length,
      activas: rutas.filter(r => r.activo).length,
      inactivas: rutas.filter(r => !r.activo).length,
      populares: rutas.filter(r => (r.total_viajes || 0) >= 5).length,
      nuevas: rutas.filter(r => (r.total_viajes || 0) === 0).length,
      rentables: rutas.filter(r => r.es_rentable).length
    };
  };

  const estadisticas = getEstadisticas();

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton loader - RESPONSIVE */}
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 sm:p-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 sm:w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 sm:w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar rutas</h3>
        <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros - RESPONSIVE CON MOBILE TOGGLE */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          {/* Header de filtros */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtros y Búsqueda</h3>
            
            {/* Botón toggle para móvil */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
            >
              <span className="text-sm font-medium">
                {showMobileFilters ? 'Ocultar' : 'Mostrar'} filtros
              </span>
              <svg 
                className={`w-4 h-4 transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
          
          {/* Filtros - HIDDEN EN MÓVIL HASTA TOGGLE */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="flex flex-col space-y-4">
              {/* Búsqueda */}
              <div className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, origen o destino..."
                    value={filtros.busqueda}
                    onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
              </div>

              {/* Selectores en grid responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filtro por estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => handleFiltroChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  >
                    <option value="todos">Todas las rutas</option>
                    <option value="activas">Activas</option>
                    <option value="inactivas">Inactivas</option>
                    <option value="populares">Populares (5+ viajes)</option>
                    <option value="nuevas">Nuevas (sin viajes)</option>
                  </select>
                </div>

                {/* Ordenar por */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                  <select
                    value={filtros.ordenPor}
                    onChange={(e) => handleFiltroChange('ordenPor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  >
                    <option value="nombre">Nombre A-Z</option>
                    <option value="viajes">Más viajes</option>
                    <option value="rentabilidad">Más rentables</option>
                    <option value="distancia">Distancia (menor a mayor)</option>
                  </select>
                </div>

                {/* Botón limpiar filtros */}
                <div className="flex items-end">
                  {(filtros.busqueda || filtros.estado !== 'todos' || filtros.ordenPor !== 'nombre') && (
                    <button
                      onClick={limpiarFiltros}
                      className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen de filtros - RESPONSIVE */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
              <span>
                Mostrando {rutasOrdenadas.length} de {rutas.length} rutas
              </span>
              <div className="flex flex-wrap gap-2">
                {filtros.busqueda && (
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                    Búsqueda: {filtros.busqueda}
                  </span>
                )}
                {filtros.estado !== 'todos' && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    Estado: {filtros.estado}
                  </span>
                )}
                {filtros.ordenPor !== 'nombre' && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    Orden: {filtros.ordenPor}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de rutas - RESPONSIVE GRID */}
      {rutasOrdenadas.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {rutas.length === 0 ? 'No hay rutas registradas' : 'No se encontraron rutas'}
          </h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            {rutas.length === 0 
              ? 'Cree su primera ruta para comenzar a organizar los viajes'
              : 'Intente ajustar los filtros de búsqueda'
            }
          </p>
          {rutas.length === 0 && (
            <button className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base">
              Crear primera ruta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {rutasOrdenadas.map(ruta => (
            <RutaCard
              key={ruta.id}
              ruta={ruta}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
            />
          ))}
        </div>
      )}

      {/* Estadísticas rápidas - RESPONSIVE GRID */}
      {rutas.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-4 sm:p-6 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4">Resumen de rutas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                {estadisticas.total}
              </div>
              <div className="text-xs sm:text-sm text-indigo-700">Total</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {estadisticas.activas}
              </div>
              <div className="text-xs sm:text-sm text-green-700">Activas</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {estadisticas.populares}
              </div>
              <div className="text-xs sm:text-sm text-blue-700">Populares</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {estadisticas.nuevas}
              </div>
              <div className="text-xs sm:text-sm text-yellow-700">Nuevas</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {estadisticas.rentables}
              </div>
              <div className="text-xs sm:text-sm text-purple-700">Rentables</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-600">
                {estadisticas.inactivas}
              </div>
              <div className="text-xs sm:text-sm text-gray-700">Inactivas</div>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional - RESPONSIVE */}
      {rutas.length > 0 && rutasOrdenadas.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button 
              onClick={() => handleFiltroChange('estado', 'populares')}
              className="flex items-center justify-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              <span className="text-blue-800 font-medium">Ver populares</span>
            </button>

            <button 
              onClick={() => handleFiltroChange('ordenPor', 'rentabilidad')}
              className="flex items-center justify-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
              <span className="text-green-800 font-medium">Más rentables</span>
            </button>

            <button 
              onClick={() => handleFiltroChange('estado', 'nuevas')}
              className="flex items-center justify-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span className="text-orange-800 font-medium">Sin usar</span>
            </button>

            <button 
              onClick={onRefresh}
              className="flex items-center justify-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span className="text-purple-800 font-medium">Actualizar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}