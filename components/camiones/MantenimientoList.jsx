// components/camiones/MantenimientoList.jsx - SISTEMA DE FLETES
import { useState } from 'react';
import { useMantenimientos } from '../../hooks/useMantenimientos';

export default function MantenimientoList({ 
  camionId = null,
  showFilters = true,
  showActions = true,
  onEdit,
  onDelete,
  onCreateGasto,
  limit = 10
}) {
  const [filtros, setFiltros] = useState({
    tipo: '',
    desde: '',
    hasta: ''
  });

  const {
    mantenimientos,
    loading,
    error,
    pagination,
    totalMantenimientos,
    changePage,
    refresh,
    clearError
  } = useMantenimientos(camionId, true);

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  // Obtener color según prioridad
  const getPrioridadColor = (fechaMantenimiento, proximoServiceKm, kmActual) => {
    if (!fechaMantenimiento) return 'bg-gray-100 text-gray-800';

    const diasDesdeMantenimiento = Math.floor(
      (new Date() - new Date(fechaMantenimiento)) / (1000 * 60 * 60 * 24)
    );

    // Si tiene próximo service programado
    if (proximoServiceKm && kmActual) {
      const kmRestantes = proximoServiceKm - kmActual;
      if (kmRestantes <= 1000) return 'bg-red-100 text-red-800';
      if (kmRestantes <= 3000) return 'bg-yellow-100 text-yellow-800';
    }

    // Por tiempo
    if (diasDesdeMantenimiento >= 180) return 'bg-red-100 text-red-800';
    if (diasDesdeMantenimiento >= 150) return 'bg-yellow-100 text-yellow-800';
    
    return 'bg-green-100 text-green-800';
  };

  // Obtener texto de estado
  const getEstadoTexto = (fechaMantenimiento, proximoServiceKm, kmActual) => {
    if (!fechaMantenimiento) return 'Sin fecha';

    const diasDesdeMantenimiento = Math.floor(
      (new Date() - new Date(fechaMantenimiento)) / (1000 * 60 * 60 * 24)
    );

    // Si tiene próximo service programado
    if (proximoServiceKm && kmActual) {
      const kmRestantes = proximoServiceKm - kmActual;
      if (kmRestantes <= 1000) return 'Service urgente';
      if (kmRestantes <= 3000) return 'Service próximo';
    }

    // Por tiempo
    if (diasDesdeMantenimiento >= 180) return 'Service vencido';
    if (diasDesdeMantenimiento >= 150) return 'Service próximo';
    
    return 'Al día';
  };

  // Manejar cambio de filtros
  const handleFiltroChange = (name, value) => {
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      tipo: '',
      desde: '',
      hasta: ''
    });
  };

  // Manejar paginación
  const handlePageChange = (newOffset) => {
    changePage(newOffset, filtros);
  };

  if (loading && mantenimientos.length === 0) {
    return (
      <div className="space-y-4">
        {/* Skeleton loader */}
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-18"></div>
                <div className="h-4 bg-gray-200 rounded w-14"></div>
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
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar mantenimientos</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => { clearError(); refresh(); }}
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
              {/* Filtro por tipo */}
              <select
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Todos los tipos</option>
                <option value="SERVICE">Service</option>
                <option value="ACEITE">Cambio aceite</option>
                <option value="FILTROS">Filtros</option>
                <option value="FRENOS">Frenos</option>
                <option value="NEUMÁTICOS">Neumáticos</option>
                <option value="REPARACIÓN">Reparaciones</option>
              </select>

              {/* Fecha desde */}
              <input
                type="date"
                value={filtros.desde}
                onChange={(e) => handleFiltroChange('desde', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Desde"
              />

              {/* Fecha hasta */}
              <input
                type="date"
                value={filtros.hasta}
                onChange={(e) => handleFiltroChange('hasta', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Hasta"
              />

              {/* Botón limpiar filtros */}
              {(filtros.tipo || filtros.desde || filtros.hasta) && (
                <button
                  onClick={limpiarFiltros}
                  className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Resumen de filtros */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {mantenimientos.length} de {pagination.total} mantenimientos
            </span>
            <button
              onClick={refresh}
              className="text-orange-600 hover:text-orange-800 font-medium flex items-center space-x-1"
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista de mantenimientos */}
      {mantenimientos.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No hay mantenimientos registrados
          </h3>
          <p className="text-gray-500 mb-6">
            {camionId 
              ? 'Registre el primer mantenimiento para este camión'
              : 'No se encontraron mantenimientos con los filtros aplicados'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mantenimientos.map(mantenimiento => (
            <div key={mantenimiento.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              {/* Header con fecha y tipo */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">{mantenimiento.tipo}</h4>
                    <p className="text-sm text-gray-600">{formatDate(mantenimiento.fecha)}</p>
                    {!camionId && mantenimiento.patente && (
                      <p className="text-sm text-blue-600 font-medium">
                        {mantenimiento.patente} - {mantenimiento.marca} {mantenimiento.modelo}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Estado del mantenimiento */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    getPrioridadColor(mantenimiento.fecha, mantenimiento.proximo_service_km, mantenimiento.kilometraje)
                  }`}>
                    {getEstadoTexto(mantenimiento.fecha, mantenimiento.proximo_service_km, mantenimiento.kilometraje)}
                  </span>
                  
                  {/* Indicador de gasto */}
                  {mantenimiento.tiene_gasto_asociado ? (
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>Con gasto</span>
                    </div>
                  ) : mantenimiento.costo && mantenimiento.costo > 0 ? (
                    <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                      <span>Sin gasto</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Descripción */}
              {mantenimiento.descripcion && (
                <div className="mb-4">
                  <p className="text-gray-700">{mantenimiento.descripcion}</p>
                </div>
              )}

              {/* Información detallada */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-sm">
                  <p className="text-gray-600">Costo</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(mantenimiento.costo)}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Kilometraje</p>
                  <p className="font-semibold text-gray-800">
                    {mantenimiento.kilometraje ? `${mantenimiento.kilometraje.toLocaleString()} km` : 'N/A'}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Próximo service</p>
                  <p className="font-semibold text-gray-800">
                    {mantenimiento.proximo_service_km ? `${mantenimiento.proximo_service_km.toLocaleString()} km` : 'N/A'}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Gasto asociado</p>
                  <p className="font-semibold text-gray-800">
                    {mantenimiento.tiene_gasto_asociado ? formatCurrency(mantenimiento.gasto_total) : 'No'}
                  </p>
                </div>
              </div>

              {/* Observaciones */}
              {mantenimiento.observaciones && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Observaciones:</p>
                  <p className="text-sm text-gray-800">{mantenimiento.observaciones}</p>
                </div>
              )}

              {/* Acciones */}
              {showActions && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    {/* Crear gasto si no existe */}
                    {!mantenimiento.tiene_gasto_asociado && mantenimiento.costo && mantenimiento.costo > 0 && onCreateGasto && (
                      <button
                        onClick={() => onCreateGasto(mantenimiento)}
                        className="inline-flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium"
                        title="Crear gasto desde este mantenimiento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                        </svg>
                        <span>Crear gasto</span>
                      </button>
                    )}

                    {/* Ver gasto asociado */}
                    {mantenimiento.tiene_gasto_asociado && mantenimiento.gasto_id && (
                      <a
                        href={`/dinero/historial-gastos?gasto_id=${mantenimiento.gasto_id}`}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        title="Ver gasto asociado"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        <span>Ver gasto</span>
                      </a>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {/* Botón editar */}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(mantenimiento)}
                        className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm font-medium"
                        title="Editar mantenimiento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        <span>Editar</span>
                      </button>
                    )}

                    {/* Botón eliminar */}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(mantenimiento)}
                        className="inline-flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium"
                        title="Eliminar mantenimiento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-600">
            Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total} mantenimientos
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Página anterior */}
            <button
              onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
              disabled={pagination.offset === 0 || loading}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                pagination.offset === 0 || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Anterior
            </button>

            {/* Página actual */}
            <span className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm font-medium">
              {Math.floor(pagination.offset / pagination.limit) + 1}
            </span>

            {/* Página siguiente */}
            <button
              onClick={() => handlePageChange(pagination.offset + pagination.limit)}
              disabled={pagination.offset + pagination.limit >= pagination.total || loading}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                pagination.offset + pagination.limit >= pagination.total || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}