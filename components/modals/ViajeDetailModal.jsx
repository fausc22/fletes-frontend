// components/modals/ViajeDetailModal.jsx - Modal responsive para detalles del viaje
import { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

export default function ViajeDetailModal({ viaje, isOpen, onClose }) {
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

  const calcularDiasEnViaje = (fechaInicio) => {
    if (!fechaInicio) return 0;
    const inicio = new Date(fechaInicio);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const diasEnViaje = calcularDiasEnViaje(viaje.fecha_inicio);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{
        modal: 'rounded-xl max-w-4xl w-full mx-4',
        modalContainer: 'flex items-center justify-center p-4'
      }}
      styles={{
        modal: {
          maxHeight: '90vh',
          overflow: 'auto'
        }
      }}
    >
      <div className="p-6">
        {/* Header del modal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Detalles del Viaje
            </h2>
            <p className="text-gray-600 mt-1">
              {viaje.patente} - {viaje.marca} {viaje.modelo}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              diasEnViaje <= 2 
                ? 'bg-green-100 text-green-800' 
                : diasEnViaje <= 5 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {diasEnViaje} día{diasEnViaje !== 1 ? 's' : ''} en viaje
            </span>
          </div>
        </div>

        {/* Información principal en grid responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🚛 Información del Camión</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Patente:</strong> {viaje.patente}</p>
              <p><strong>Marca:</strong> {viaje.marca}</p>
              <p><strong>Modelo:</strong> {viaje.modelo}</p>
              <p><strong>Año:</strong> {viaje.año || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">🗺️ Información de Ruta</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Ruta:</strong> {viaje.ruta_nombre || 'Personalizada'}</p>
              <p><strong>Origen:</strong> {viaje.origen || 'N/A'}</p>
              <p><strong>Destino:</strong> {viaje.destino || 'N/A'}</p>
              <p><strong>Km Estimados:</strong> {viaje.km_estimados_recorridos?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-medium text-purple-800 mb-2">📅 Fechas del Viaje</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Inicio:</strong> {formatearFecha(viaje.fecha_inicio)}</p>
              <p><strong>Estado:</strong> <span className="font-semibold text-purple-700">EN CURSO</span></p>
              <p><strong>Duración:</strong> {diasEnViaje} día{diasEnViaje !== 1 ? 's' : ''}</p>
              <p><strong>ID Viaje:</strong> #{viaje.id}</p>
            </div>
          </div>
        </div>

        {/* Información detallada del kilometraje */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📏 Kilometraje</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {viaje.km_inicial?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Km Inicial</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {viaje.km_actuales_camion?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Km Actuales</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {viaje.km_estimados_recorridos?.toLocaleString() || 'Calculando...'}
              </div>
              <div className="text-sm text-gray-600">Km Estimados</div>
            </div>
          </div>
        </div>

        {/* Observaciones si existen */}
        {viaje.observaciones && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">📝 Observaciones del Inicio</h3>
            <p className="text-yellow-700">{viaje.observaciones}</p>
          </div>
        )}

        {/* Información adicional si está disponible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">💰 Información Financiera</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Precio estimado: {viaje.precio_estimado ? `$${viaje.precio_estimado.toLocaleString()}` : 'A definir'}</p>
              <p>• Combustible estimado: {viaje.combustible_estimado ? `$${viaje.combustible_estimado.toLocaleString()}` : 'A calcular'}</p>
              <p>• Peajes estimados: {viaje.peajes_estimados ? `$${viaje.peajes_estimados.toLocaleString()}` : 'A calcular'}</p>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">🔧 Estado del Camión</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Estado: {viaje.activo ? 'Activo' : 'Inactivo'}</p>
              <p>• Último mantenimiento: {viaje.ultimo_mantenimiento || 'No registrado'}</p>
              <p>• Próximo mantenimiento: {viaje.proximo_mantenimiento || 'No programado'}</p>
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
            <button
              onClick={() => {
                // Aquí puedes abrir el modal de agregar gasto
                onClose();
                // dispatch openGastoModal o similar
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
              <span>Agregar Gasto</span>
            </button>
            
            <a
              href={`/viajes/finalizar/${viaje.id}`}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              onClick={onClose}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Finalizar Viaje</span>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}