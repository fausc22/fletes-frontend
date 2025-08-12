// components/modals/ViajeDetailHistorialModal.jsx - Modal de detalles para historial
import { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

export default function ViajeDetailHistorialModal({ viaje, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !viaje) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const calcularRendimiento = () => {
    if (!viaje.km_recorridos || !viaje.ingresos_total || !viaje.gastos_total) return null;
    
    const ganancia = parseFloat(viaje.ingresos_total) - parseFloat(viaje.gastos_total);
    const rentabilidadPorKm = ganancia / viaje.km_recorridos;
    const margenPorcentaje = (ganancia / parseFloat(viaje.ingresos_total)) * 100;
    
    return {
      ganancia,
      rentabilidadPorKm,
      margenPorcentaje
    };
  };

  const rendimiento = calcularRendimiento();

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{
        modal: 'rounded-xl max-w-5xl w-full mx-4',
        modalContainer: 'flex items-center justify-center p-4'
      }}
      styles={{
        modal: {
          maxHeight: '90vh',
          overflow: 'auto'
        }
      }}
    >
      <div className="p-4 sm:p-6">
        {/* Header del modal */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-3 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Viaje #{viaje.id}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(viaje.estado)}`}>
                {getEstadoTexto(viaje.estado)}
              </span>
            </div>
            <p className="text-gray-600">
              {viaje.patente} - {viaje.marca} {viaje.modelo}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Creado: {formatearFecha(viaje.fecha_creacion)}
          </div>
        </div>

        {/* Información principal en grid responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Información del camión */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
              Información del Camión
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Patente:</span>
                <span className="font-medium">{viaje.patente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Marca:</span>
                <span className="font-medium">{viaje.marca}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modelo:</span>
                <span className="font-medium">{viaje.modelo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Año:</span>
                <span className="font-medium">{viaje.año || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Información de ruta */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
              </svg>
              Información de Ruta
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ruta:</span>
                <span className="font-medium">{viaje.ruta_nombre || 'Personalizada'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Origen:</span>
                <span className="font-medium">{viaje.origen || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destino:</span>
                <span className="font-medium">{viaje.destino || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distancia:</span>
                <span className="font-medium">
                  {viaje.distancia_km ? `${viaje.distancia_km.toLocaleString()} km` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Fechas del viaje */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Fechas del Viaje
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Inicio:</span>
                <span className="font-medium">{formatearFecha(viaje.fecha_inicio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fin:</span>
                <span className="font-medium">{formatearFecha(viaje.fecha_fin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium">{formatearDuracion(viaje.fecha_inicio, viaje.fecha_fin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${
                  viaje.estado === 'COMPLETADO' ? 'text-green-600' : 
                  viaje.estado === 'CANCELADO' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {getEstadoTexto(viaje.estado)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información detallada del kilometraje */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Kilometraje y Rendimiento
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {viaje.km_inicial?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Km Inicial</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {viaje.km_final?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Km Final</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {viaje.km_recorridos?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Km Recorridos</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">
                {viaje.tiempo_estimado_horas ? `${viaje.tiempo_estimado_horas}h` : 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Tiempo Est.</div>
            </div>
          </div>
        </div>

        {/* Información financiera */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-bold text-green-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
              💰 Información Financiera
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Ingresos totales:</span>
                <span className="font-bold text-green-800">
                  ${viaje.ingresos_total ? parseFloat(viaje.ingresos_total).toLocaleString() : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Gastos totales:</span>
                <span className="font-bold text-red-600">
                  ${viaje.gastos_total ? parseFloat(viaje.gastos_total).toLocaleString() : '0'}
                </span>
              </div>
              <div className="flex justify-between border-t border-green-300 pt-2">
                <span className="text-green-700 font-medium">Ganancia neta:</span>
                <span className={`font-bold text-lg ${
                  rendimiento && rendimiento.ganancia >= 0 ? 'text-green-800' : 'text-red-600'
                }`}>
                  ${rendimiento ? rendimiento.ganancia.toLocaleString() : '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              📊 Análisis de Rendimiento
            </h4>
            {rendimiento ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Ganancia por km:</span>
                  <span className="font-bold text-blue-800">
                    ${rendimiento.rentabilidadPorKm.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Margen de ganancia:</span>
                  <span className={`font-bold ${
                    rendimiento.margenPorcentaje >= 20 ? 'text-green-600' :
                    rendimiento.margenPorcentaje >= 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {rendimiento.margenPorcentaje.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Costo promedio por km:</span>
                  <span className="font-bold text-blue-800">
                    ${viaje.gastos_total && viaje.km_recorridos ? 
                      (parseFloat(viaje.gastos_total) / viaje.km_recorridos).toFixed(2) : '0'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-blue-700 text-sm">No hay suficiente información financiera para calcular el rendimiento.</p>
            )}
          </div>
        </div>

        {/* Observaciones */}
        {(viaje.observaciones || viaje.observaciones_finales) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-yellow-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              📝 Observaciones
            </h4>
            <div className="space-y-3">
              {viaje.observaciones && (
                <div>
                  <span className="text-yellow-800 font-medium text-sm">Observaciones del inicio:</span>
                  <p className="text-yellow-700 mt-1">{viaje.observaciones}</p>
                </div>
              )}
              {viaje.observaciones_finales && (
                <div>
                  <span className="text-yellow-800 font-medium text-sm">Observaciones de finalización:</span>
                  <p className="text-yellow-700 mt-1">{viaje.observaciones_finales}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">🔧 Estado del Camión al Finalizar</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Kilometraje final: {viaje.km_final?.toLocaleString() || 'N/A'} km</p>
              <p>• Estado: {viaje.estado_final || 'Normal'}</p>
              <p>• Próximo mantenimiento: {viaje.proximo_mantenimiento || 'No programado'}</p>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">📈 Comparación con Estimaciones</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {viaje.km_recorridos && viaje.distancia_km && (
                <p>• Diferencia km: {Math.abs(viaje.km_recorridos - viaje.distancia_km)} km 
                  {viaje.km_recorridos > viaje.distancia_km ? ' más' : ' menos'} de lo estimado</p>
              )}
              <p>• Eficiencia: {viaje.km_recorridos && viaje.tiempo_estimado_horas ? 
                `${(viaje.km_recorridos / viaje.tiempo_estimado_horas).toFixed(0)} km/h promedio` : 'N/A'}</p>
              <p>• Rentabilidad: {rendimiento && rendimiento.margenPorcentaje >= 15 ? 'Excelente' : 
                rendimiento && rendimiento.margenPorcentaje >= 10 ? 'Buena' : 'A mejorar'}</p>
            </div>
          </div>
        </div>

        {/* Acciones del modal - Responsivas */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cerrar
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
            <a
              href={`/dinero/movimientos?viaje_id=${viaje.id}`}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              onClick={onClose}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
              <span>Ver Movimientos</span>
            </a>
            
            {viaje.estado === 'EN_CURSO' && (
              <a
                href={`/viajes/finalizar/${viaje.id}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                onClick={onClose}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Finalizar Viaje</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}