// components/rutas/RutaCard.jsx - SISTEMA DE FLETES
import { useState } from 'react';
import Link from 'next/link';

export default function RutaCard({ ruta, onEdit, onDelete, showActions = true }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Función para formatear distancia
  const formatDistance = (km) => {
    if (!km) return 'N/A';
    return `${parseFloat(km).toLocaleString()} km`;
  };

  // Función para formatear tiempo
  const formatTime = (horas) => {
    if (!horas) return 'N/A';
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    return `${h}h ${m}m`;
  };

  // Función para obtener el color del estado
  const getEstadoColor = (activo, totalViajes) => {
    if (!activo) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (totalViajes > 10) return 'bg-green-100 text-green-800 border-green-200';
    if (totalViajes > 5) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (totalViajes > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  // Función para obtener texto del estado
  const getEstadoTexto = (activo, totalViajes) => {
    if (!activo) return 'Inactiva';
    if (totalViajes > 10) return 'Muy Popular';
    if (totalViajes > 5) return 'Popular';
    if (totalViajes > 0) return 'En Uso';
    return 'Nueva';
  };

  // Función para confirmar eliminación
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(ruta.id);
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Función para calcular rentabilidad por km
  const getRentabilidadPorKm = () => {
    if (!ruta.promedio_ingresos || !ruta.promedio_km_real) return 0;
    return Math.round(ruta.promedio_ingresos / ruta.promedio_km_real);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative">
      {/* Header con origen y destino */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{ruta.nombre}</h3>
            <p className="text-sm text-gray-600">{ruta.origen} → {ruta.destino}</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          getEstadoColor(ruta.activo, ruta.total_viajes)
        }`}>
          {getEstadoTexto(ruta.activo, ruta.total_viajes)}
        </span>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-sm">
          <p className="text-gray-600">Distancia</p>
          <p className="font-semibold text-gray-800">{formatDistance(ruta.distancia_km)}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-600">Tiempo estimado</p>
          <p className="font-semibold text-gray-800">{formatTime(ruta.tiempo_estimado_horas)}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-600">Total viajes</p>
          <p className="font-semibold text-gray-800">{ruta.total_viajes || 0}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-600">Viajes completados</p>
          <p className="font-semibold text-gray-800">{ruta.viajes_completados || 0}</p>
        </div>
      </div>

      {/* Métricas de rentabilidad */}
      {ruta.total_viajes > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-green-50 rounded-lg">
          <div className="text-sm">
            <p className="text-green-600">Promedio ingresos</p>
            <p className="font-bold text-green-800">${(ruta.promedio_ingresos || 0).toLocaleString()}</p>
          </div>
          <div className="text-sm">
            <p className="text-green-600">Por kilómetro</p>
            <p className="font-bold text-green-800">${getRentabilidadPorKm()}/km</p>
          </div>
        </div>
      )}

      {/* Indicador de rentabilidad */}
      {ruta.es_rentable && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span className="text-sm font-medium text-blue-800">Ruta rentable</span>
          </div>
        </div>
      )}

      {/* Estado inactivo */}
      {!ruta.activo && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
            </svg>
            <span className="text-sm font-medium text-gray-600">Ruta inactiva</span>
          </div>
        </div>
      )}

      {/* Acciones */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            {/* Botón ver detalles */}
            <Link 
              href={`/rutas/${ruta.id}`}
              className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span>Ver detalles</span>
            </Link>

            {/* Botón usar en viaje */}
            <Link 
              href={`/viajes/nuevo?ruta_id=${ruta.id}`}
              className="inline-flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>Usar en viaje</span>
            </Link>
          </div>

          <div className="flex space-x-2">
            {/* Botón editar */}
            <button
              onClick={() => onEdit(ruta)}
              className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm font-medium"
              title="Editar ruta"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>Editar</span>
            </button>

            {/* Botón eliminar */}
            <button
              onClick={handleDeleteClick}
              className="inline-flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium"
              title="Eliminar ruta"
              disabled={ruta.total_viajes > 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirmar eliminación</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Está seguro que desea eliminar la ruta <strong>{ruta.nombre}</strong>?
              {ruta.total_viajes > 0 && (
                <span className="block text-sm text-orange-600 mt-2">
                  Nota: La ruta será desactivada para mantener el historial de viajes.
                </span>
              )}
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}