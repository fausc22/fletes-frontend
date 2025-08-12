// components/camiones/CamionCard.jsx - VERSIÓN 100% RESPONSIVA
import { useState } from 'react';
import Link from 'next/link';

export default function CamionCard({ camion, onEdit, onDelete, onViewDetails, showActions = true }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-AR');
    } catch {
      return 'N/A';
    }
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'EN_VIAJE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DISPONIBLE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para obtener texto del estado
  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'EN_VIAJE':
        return 'En viaje';
      case 'DISPONIBLE':
        return 'Disponible';
      default:
        return 'Inactivo';
    }
  };

  // Función para confirmar eliminación
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(camion.id);
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header con patente y estado - RESPONSIVO */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{camion.patente}</h3>
              <p className="text-sm text-gray-600 truncate">{camion.marca} {camion.modelo}</p>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium border self-start sm:self-center ${getEstadoColor(camion.estado)}`}>
            {getEstadoTexto(camion.estado)}
          </span>
        </div>

        {/* Información principal - GRID RESPONSIVO */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="text-sm">
            <p className="text-gray-600 text-xs sm:text-sm">Año</p>
            <p className="font-semibold text-gray-800 text-sm sm:text-base">{camion.año}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-600 text-xs sm:text-sm">Kilómetros</p>
            <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{camion.kilometros?.toLocaleString() || '0'} km</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-600 text-xs sm:text-sm">Último service</p>
            <p className="font-semibold text-gray-800 text-sm sm:text-base">{formatDate(camion.ultimo_service)}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-600 text-xs sm:text-sm">Mantenimientos</p>
            <p className="font-semibold text-gray-800 text-sm sm:text-base">{camion.total_mantenimientos || 0}</p>
          </div>
        </div>

        {/* Indicadores adicionales */}
        {camion.tiene_viaje_activo && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span className="text-sm font-medium text-yellow-800">Actualmente en viaje</span>
            </div>
          </div>
        )}

        {/* Estado inactivo */}
        {!camion.activo && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
              </svg>
              <span className="text-sm font-medium text-gray-600">Camión inactivo</span>
            </div>
          </div>
        )}

        {/* Acciones - COMPLETAMENTE RESPONSIVO */}
        {showActions && (
          <div className="pt-4 border-t border-gray-200">
            {/* DESKTOP: Botones horizontales */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={() => onViewDetails(camion)}
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <span>Ver detalles</span>
                </button>

                <Link 
                  href={`/camiones/mantenimientos?camion=${camion.id}`}
                  className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>Mantenimiento</span>
                </Link>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(camion)}
                  className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                  title="Editar camión"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  <span>Editar</span>
                </button>

                <button
                  onClick={handleDeleteClick}
                  className="inline-flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                  title="Eliminar camión"
                  disabled={camion.tiene_viaje_activo}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>

            {/* MÓVIL: Botones en grid 2x2 */}
            <div className="sm:hidden grid grid-cols-2 gap-2">
              <button
                onClick={() => onViewDetails(camion)}
                className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <span>Detalles</span>
              </button>

              <Link 
                href={`/camiones/mantenimientos?camion=${camion.id}`}
                className="flex items-center justify-center space-x-2 bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>Mantenim.</span>
              </Link>

              <button
                onClick={() => onEdit(camion)}
                className="flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                <span>Editar</span>
              </button>

              <button
                onClick={handleDeleteClick}
                className="flex items-center justify-center space-x-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={camion.tiene_viaje_activo}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación - RESPONSIVO */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-gray-900">Confirmar eliminación</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6 text-sm sm:text-base">
              ¿Está seguro que desea eliminar el camión <strong>{camion.patente}</strong>?
              {camion.total_mantenimientos > 0 && (
                <span className="block text-sm text-orange-600 mt-2">
                  Nota: El camión será desactivado para mantener el historial de mantenimientos.
                </span>
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors order-1 sm:order-2"
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