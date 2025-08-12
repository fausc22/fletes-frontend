// components/camiones/CamionDetailsModal.jsx - MODAL DE DETALLES DEL CAMIÓN
import { useEffect, useState } from 'react';

export default function CamionDetailsModal({ camion, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Manejar tecla ESC para cerrar
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      return new Date(dateString).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Formatear fecha de creación
  const formatCreationDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Obtener color del estado
  const getEstadoInfo = (activo, estado) => {
    if (!activo) {
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        texto: 'Inactivo',
        icono: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"/>
          </svg>
        )
      };
    }

    switch (estado) {
      case 'EN_VIAJE':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          texto: 'En viaje',
          icono: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          )
        };
      case 'DISPONIBLE':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          texto: 'Disponible',
          icono: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          )
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          texto: 'Estado desconocido',
          icono: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          )
        };
    }
  };

  // Calcular tiempo desde último service
  const calcularTiempoDesdeService = (fechaService) => {
    if (!fechaService) return null;
    
    const hoy = new Date();
    const fecha = new Date(fechaService);
    const diferenciaDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias < 0) return 'Fecha futura';
    if (diferenciaDias === 0) return 'Hoy';
    if (diferenciaDias === 1) return 'Hace 1 día';
    if (diferenciaDias < 30) return `Hace ${diferenciaDias} días`;
    if (diferenciaDias < 365) return `Hace ${Math.floor(diferenciaDias / 30)} meses`;
    return `Hace ${Math.floor(diferenciaDias / 365)} años`;
  };

  // No renderizar hasta que esté montado y abierto
  if (!mounted || !isOpen || !camion) {
    return null;
  }

  const estadoInfo = getEstadoInfo(camion.activo, camion.estado);
  const tiempoDesdeService = calcularTiempoDesdeService(camion.ultimo_service);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header del modal */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                  <circle cx="7" cy="19" r="2"/>
                  <circle cx="17" cy="19" r="2"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">{camion.patente}</h2>
                <p className="text-blue-100 text-sm sm:text-base">{camion.marca} {camion.modelo} ({camion.año})</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
              title="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Estado actual */}
          <div className="mb-6">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${estadoInfo.color}`}>
              {estadoInfo.icono}
              <span className="font-semibold">{estadoInfo.texto}</span>
            </div>
          </div>

          {/* Grid de información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Información básica */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Información Básica
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Marca</p>
                  <p className="font-semibold text-gray-900">{camion.marca}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Modelo</p>
                  <p className="font-semibold text-gray-900">{camion.modelo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Año de fabricación</p>
                  <p className="font-semibold text-gray-900">{camion.año}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patente</p>
                  <p className="font-semibold text-gray-900 text-lg tracking-wider bg-white px-3 py-1 rounded border-2 border-gray-300 font-mono">
                    {camion.patente}
                  </p>
                </div>
              </div>
            </div>

            {/* Información operativa */}
            <div className="bg-orange-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Información Operativa
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Kilómetros actuales</p>
                  <p className="font-semibold text-gray-900 text-xl">
                    {camion.kilometros?.toLocaleString() || '0'} <span className="text-sm text-gray-600">km</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado actual</p>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-sm font-medium ${estadoInfo.color}`}>
                    {estadoInfo.icono}
                    <span>{estadoInfo.texto}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Camión activo</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${camion.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-semibold text-gray-900">
                      {camion.activo ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
                {camion.tiene_viaje_activo && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      <span className="text-sm font-medium text-yellow-800">Viaje en curso</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información de mantenimiento */}
            <div className="bg-green-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Mantenimiento
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Último service</p>
                  <p className="font-semibold text-gray-900">{formatDate(camion.ultimo_service)}</p>
                  {tiempoDesdeService && (
                    <p className="text-sm text-gray-500">{tiempoDesdeService}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de mantenimientos</p>
                  <p className="font-semibold text-gray-900 text-xl">
                    {camion.total_mantenimientos || 0}
                  </p>
                </div>
                {camion.ultimo_service && (
                  <div className={`p-3 rounded-lg border ${
                    tiempoDesdeService && (tiempoDesdeService.includes('meses') || tiempoDesdeService.includes('años'))
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-green-100 border-green-300 text-green-800'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span className="text-sm font-medium">
                        {tiempoDesdeService && (tiempoDesdeService.includes('meses') || tiempoDesdeService.includes('años'))
                          ? 'Service vencido'
                          : 'Service al día'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 rounded-xl p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Información del Sistema
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fecha de registro</p>
                <p className="font-semibold text-gray-900">{formatCreationDate(camion.fecha_creacion)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID en el sistema</p>
                <p className="font-semibold text-gray-900 font-mono">#{camion.id}</p>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          {(camion.total_viajes || camion.total_gastos || camion.total_ingresos) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {camion.total_viajes && (
                <div className="bg-white border-2 border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{camion.total_viajes}</div>
                  <div className="text-sm text-gray-600">Viajes realizados</div>
                </div>
              )}
              {camion.total_gastos && (
                <div className="bg-white border-2 border-red-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">${camion.total_gastos.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total en gastos</div>
                </div>
              )}
              {camion.total_ingresos && (
                <div className="bg-white border-2 border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">${camion.total_ingresos.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total en ingresos</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer del modal con acciones */}
        <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Información detallada del camión {camion.patente}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cerrar
              </button>
              <a
                href={`/camiones/mantenimientos?camion=${camion.id}`}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-center"
              >
                Ver Mantenimientos
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}