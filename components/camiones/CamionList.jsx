// components/camiones/CamionList.jsx - SISTEMA DE FLETES
import { useState } from 'react';
import CamionCard from './CamionCard';

export default function CamionList({ 
  camiones, 
  loading, 
  error, 
  onEdit, 
  onDelete, 
  onRefresh,
  showFilters = true,
  showActions = true 
}) {
  const [filtros, setFiltros] = useState({
    estado: 'todos', // todos, disponible, en_viaje, inactivo
    busqueda: ''
  });

  // Filtrar camiones según criterios
  const camionesFiltrados = camiones.filter(camion => {
    // Filtro por estado
    if (filtros.estado === 'disponible' && camion.estado !== 'DISPONIBLE') return false;
    if (filtros.estado === 'en_viaje' && camion.estado !== 'EN_VIAJE') return false;
    if (filtros.estado === 'inactivo' && camion.activo !== 0) return false;
    if (filtros.estado === 'activo' && camion.activo !== 1) return false;

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const coincide = 
        camion.patente?.toLowerCase().includes(busqueda) ||
        camion.marca?.toLowerCase().includes(busqueda) ||
        camion.modelo?.toLowerCase().includes(busqueda);
      
      if (!coincide) return false;
    }

    return true;
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
      busqueda: ''
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton loader */}
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
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
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar camiones</h3>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
            
            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
              {/* Búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por patente, marca..."
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>

              {/* Filtro por estado */}
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="en_viaje">En viaje</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>

              {/* Botón limpiar filtros */}
              {(filtros.busqueda || filtros.estado !== 'todos') && (
                <button
                  onClick={limpiarFiltros}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Resumen de filtros */}
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Mostrando {camionesFiltrados.length} de {camiones.length} camiones
            </span>
            {filtros.busqueda && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Busqueda: {filtros.busqueda}
              </span>
            )}
            {filtros.estado !== 'todos' && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Estado: {filtros.estado.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Lista de camiones */}
      {camionesFiltrados.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
              <circle cx="7" cy="19" r="2"/>
              <circle cx="17" cy="19" r="2"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {camiones.length === 0 ? 'No hay camiones registrados' : 'No se encontraron camiones'}
          </h3>
          <p className="text-gray-500 mb-6">
            {camiones.length === 0 
              ? 'Agregue su primer camión para comenzar'
              : 'Intente ajustar los filtros de búsqueda'
            }
          </p>
          {camiones.length === 0 && (
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Agregar primer camión
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camionesFiltrados.map(camion => (
            <CamionCard
              key={camion.id}
              camion={camion}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
            />
          ))}
        </div>
      )}

      {/* Estadísticas rápidas */}
      {camiones.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Resumen de flota</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {camiones.filter(c => c.activo).length}
              </div>
              <div className="text-sm text-blue-700">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {camiones.filter(c => c.estado === 'DISPONIBLE').length}
              </div>
              <div className="text-sm text-green-700">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {camiones.filter(c => c.estado === 'EN_VIAJE').length}
              </div>
              <div className="text-sm text-yellow-700">En viaje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {camiones.filter(c => !c.activo).length}
              </div>
              <div className="text-sm text-gray-700">Inactivos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}