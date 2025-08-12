// components/rutas/RutaList.jsx - SISTEMA DE FLETES
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
        {/* Skeleton loader */}
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar rutas</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h3 className="text-lg font-semibold text-gray-800">Filtros y Búsqueda</h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, origen o destino..."
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>

              {/* Filtro por estado */}
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="todos">Todas las rutas</option>
                <option value="activas">Activas</option>
                <option value="inactivas">Inactivas</option>
                <option value="populares">Populares (5+ viajes)</option>
                <option value="nuevas">Nuevas (sin viajes)</option>
              </select>

              {/* Ordenar por */}
              <select
                value={filtros.ordenPor}
                onChange={(e) => handleFiltroChange('ordenPor', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="nombre">Nombre A-Z</option>
                <option value="viajes">Más viajes</option>
                <option value="rentabilidad">Más rentables</option>
                <option value="distancia">Distancia (menor a mayor)</option>
              </select>

              {/* Botón limpiar filtros */}
              {(filtros.busqueda || filtros.estado !== 'todos' || filtros.ordenPor !== 'nombre') && (
                <button
                  onClick={limpiarFiltros}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Resumen de filtros */}
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
      )}

      {/* Lista de rutas */}
      {rutasOrdenadas.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {rutas.length === 0 ? 'No hay rutas registradas' : 'No se encontraron rutas'}
          </h3>
          <p className="text-gray-500 mb-6">
            {rutas.length === 0 
              ? 'Cree su primera ruta para comenzar a organizar los viajes'
              : 'Intente ajustar los filtros de búsqueda'
            }
          </p>
          {rutas.length === 0 && (
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              Crear primera ruta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Estadísticas rápidas */}
      {rutas.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4">Resumen de rutas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {estadisticas.total}
              </div>
              <div className="text-sm text-indigo-700">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {estadisticas.activas}
              </div>
              <div className="text-sm text-green-700">Activas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {estadisticas.populares}
              </div>
              <div className="text-sm text-blue-700">Populares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {estadisticas.nuevas}
              </div>
              <div className="text-sm text-yellow-700">Nuevas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {estadisticas.rentables}
              </div>
              <div className="text-sm text-purple-700">Rentables</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {estadisticas.inactivas}
              </div>
              <div className="text-sm text-gray-700">Inactivas</div>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      {rutas.length > 0 && rutasOrdenadas.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => handleFiltroChange('estado', 'populares')}
              className="flex items-center justify-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              <span className="text-blue-800 font-medium">Ver populares</span>
            </button>

            <button 
              onClick={() => handleFiltroChange('ordenPor', 'rentabilidad')}
              className="flex items-center justify-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
              <span className="text-green-800 font-medium">Más rentables</span>
            </button>

            <button 
              onClick={() => handleFiltroChange('estado', 'nuevas')}
              className="flex items-center justify-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span className="text-orange-800 font-medium">Sin usar</span>
            </button>

            <button 
              onClick={onRefresh}
              className="flex items-center justify-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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