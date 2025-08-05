// components/camiones/MantenimientoForm.jsx - SISTEMA DE FLETES
import { useState, useEffect, useCallback, useMemo } from 'react';

export default function MantenimientoForm({ 
  mantenimiento = null, 
  camion = null,
  onSave, 
  onCancel, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: '',
    descripcion: '',
    costo: '',
    kilometraje: '',
    proximo_service_km: '',
    observaciones: '',
    crear_gasto: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ TIPOS DE MANTENIMIENTO PREDEFINIDOS
  const tiposMantenimiento = [
    'SERVICE COMPLETO',
    'CAMBIO ACEITE',
    'CAMBIO FILTROS',
    'REVISIÓN FRENOS',
    'REVISIÓN NEUMÁTICOS',
    'MANTENIMIENTO PREVENTIVO',
    'REPARACIÓN MOTOR',
    'REPARACIÓN TRANSMISIÓN',
    'REPARACIÓN ELÉCTRICA',
    'INSPECCIÓN TÉCNICA',
    'OTRO'
  ];

  // ✅ MEMOIZAR DATOS INICIALES
  const initialData = useMemo(() => {
    if (mantenimiento) {
      return {
        fecha: mantenimiento.fecha ? 
          new Date(mantenimiento.fecha).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        tipo: mantenimiento.tipo || '',
        descripcion: mantenimiento.descripcion || '',
        costo: mantenimiento.costo ? mantenimiento.costo.toString() : '',
        kilometraje: mantenimiento.kilometraje ? mantenimiento.kilometraje.toString() : '',
        proximo_service_km: mantenimiento.proximo_service_km ? mantenimiento.proximo_service_km.toString() : '',
        observaciones: mantenimiento.observaciones || '',
        crear_gasto: !mantenimiento.tiene_gasto_asociado // Solo si no tiene gasto ya
      };
    }
    return {
      fecha: new Date().toISOString().split('T')[0],
      tipo: '',
      descripcion: '',
      costo: '',
      kilometraje: camion?.kilometros ? camion.kilometros.toString() : '',
      proximo_service_km: '',
      observaciones: '',
      crear_gasto: true
    };
  }, [mantenimiento, camion]);

  // ✅ CARGAR DATOS AL CAMBIAR EL MANTENIMIENTO
  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  // ✅ MANEJAR CAMBIOS EN EL FORMULARIO
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (name === 'costo' || name === 'kilometraje' || name === 'proximo_service_km') {
      // Permitir solo números y punto decimal
      processedValue = value.replace(/[^0-9.]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // ✅ VALIDAR FORMULARIO
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.fecha.trim()) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!formData.tipo.trim()) {
      newErrors.tipo = 'El tipo de mantenimiento es requerido';
    }

    // Validar fecha no futura
    const fechaMantenimiento = new Date(formData.fecha);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); // Permitir hasta hoy
    
    if (fechaMantenimiento > hoy) {
      newErrors.fecha = 'La fecha no puede ser futura';
    }

    // Validar costo si se proporciona
    if (formData.costo && (isNaN(formData.costo) || parseFloat(formData.costo) < 0)) {
      newErrors.costo = 'El costo debe ser un número positivo';
    }

    // Validar kilometraje si se proporciona
    if (formData.kilometraje) {
      const km = parseInt(formData.kilometraje);
      if (isNaN(km) || km < 0) {
        newErrors.kilometraje = 'El kilometraje debe ser un número positivo';
      } else if (camion && km < camion.kilometros) {
        newErrors.kilometraje = 'El kilometraje no puede ser menor al actual del camión';
      }
    }

    // Validar próximo service si se proporciona
    if (formData.proximo_service_km) {
      const proximoKm = parseInt(formData.proximo_service_km);
      const kmActual = formData.kilometraje ? parseInt(formData.kilometraje) : (camion?.kilometros || 0);
      
      if (isNaN(proximoKm) || proximoKm < 0) {
        newErrors.proximo_service_km = 'Debe ser un número positivo';
      } else if (proximoKm <= kmActual) {
        newErrors.proximo_service_km = 'Debe ser mayor al kilometraje actual';
      }
    }

    // Validar crear gasto
    if (formData.crear_gasto && (!formData.costo || parseFloat(formData.costo) <= 0)) {
      newErrors.crear_gasto = 'Para crear un gasto se requiere un costo mayor a cero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, camion]);

  // ✅ ESTADO DE VALIDACIÓN
  const isFormValid = useMemo(() => {
    return formData.fecha.trim().length > 0 &&
           formData.tipo.trim().length > 0 &&
           (!formData.costo || (!isNaN(formData.costo) && parseFloat(formData.costo) >= 0)) &&
           (!formData.kilometraje || (!isNaN(formData.kilometraje) && parseInt(formData.kilometraje) >= 0));
  }, [formData]);

  // ✅ MANEJAR ENVÍO
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para envío
      const dataToSend = {
        fecha: formData.fecha,
        tipo: formData.tipo.trim(),
        descripcion: formData.descripcion.trim() || null,
        costo: formData.costo ? parseFloat(formData.costo) : null,
        kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : null,
        proximo_service_km: formData.proximo_service_km ? parseInt(formData.proximo_service_km) : null,
        observaciones: formData.observaciones.trim() || null,
        crear_gasto: formData.crear_gasto && formData.costo && parseFloat(formData.costo) > 0
      };

      await onSave(dataToSend);
    } catch (error) {
      console.error('Error en formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSave]);

  // ✅ MANEJAR CANCELAR
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header del formulario */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {mantenimiento ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
          </h2>
          {camion && (
            <p className="text-sm text-gray-600 mt-1">
              Camión: {camion.patente} - {camion.marca} {camion.modelo}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Información básica */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del mantenimiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fecha */}
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.fecha ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting || loading}
            />
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de mantenimiento *
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.tipo ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting || loading}
            >
              <option value="">Seleccione un tipo</option>
              {tiposMantenimiento.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Detalles del mantenimiento realizado..."
              disabled={isSubmitting || loading}
            />
          </div>
        </div>
      </div>

      {/* Información técnica */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información técnica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Costo */}
          <div>
            <label htmlFor="costo" className="block text-sm font-medium text-gray-700 mb-2">
              Costo ($)
            </label>
            <input
              type="text"
              id="costo"
              name="costo"
              value={formData.costo}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.costo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
              disabled={isSubmitting || loading}
            />
            {errors.costo && (
              <p className="mt-1 text-sm text-red-600">{errors.costo}</p>
            )}
          </div>

          {/* Kilometraje */}
          <div>
            <label htmlFor="kilometraje" className="block text-sm font-medium text-gray-700 mb-2">
              Kilometraje actual
            </label>
            <input
              type="text"
              id="kilometraje"
              name="kilometraje"
              value={formData.kilometraje}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.kilometraje ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={camion?.kilometros?.toString() || '0'}
              disabled={isSubmitting || loading}
            />
            {errors.kilometraje && (
              <p className="mt-1 text-sm text-red-600">{errors.kilometraje}</p>
            )}
            {camion && (
              <p className="mt-1 text-sm text-gray-500">
                Kilometraje actual del camión: {camion.kilometros?.toLocaleString()} km
              </p>
            )}
          </div>

          {/* Próximo service */}
          <div>
            <label htmlFor="proximo_service_km" className="block text-sm font-medium text-gray-700 mb-2">
              Próximo service (km)
            </label>
            <input
              type="text"
              id="proximo_service_km"
              name="proximo_service_km"
              value={formData.proximo_service_km}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.proximo_service_km ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: 125000"
              disabled={isSubmitting || loading}
            />
            {errors.proximo_service_km && (
              <p className="mt-1 text-sm text-red-600">{errors.proximo_service_km}</p>
            )}
          </div>
        </div>

        {/* Observaciones */}
        <div className="mt-6">
          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Observaciones adicionales..."
            disabled={isSubmitting || loading}
          />
        </div>
      </div>

      {/* Opciones de gasto */}
      {!mantenimiento && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            Registro automático de gasto
          </h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="crear_gasto"
              name="crear_gasto"
              checked={formData.crear_gasto}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              disabled={isSubmitting || loading || !formData.costo || parseFloat(formData.costo) <= 0}
            />
            <label htmlFor="crear_gasto" className="ml-2 block text-sm text-gray-700">
              Registrar automáticamente como gasto
            </label>
          </div>
          {errors.crear_gasto && (
            <p className="mt-1 text-sm text-red-600">{errors.crear_gasto}</p>
          )}
          <p className="mt-2 text-sm text-green-600">
            {formData.crear_gasto && formData.costo && parseFloat(formData.costo) > 0
              ? `Se creará un gasto automáticamente por ${parseFloat(formData.costo).toLocaleString()}`
              : 'Se requiere un costo para crear el gasto automáticamente'
            }
          </p>
        </div>
      )}

      {/* Estado del mantenimiento existente */}
      {mantenimiento && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {mantenimiento.tiene_gasto_asociado ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                {mantenimiento.tiene_gasto_asociado 
                  ? `✅ Gasto asociado registrado por ${mantenimiento.gasto_total?.toLocaleString()}`
                  : '❌ Sin gasto asociado'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          disabled={isSubmitting || loading}
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting || loading || !isFormValid}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isSubmitting || loading || !isFormValid
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 text-white transform hover:scale-105'
          }`}
        >
          {isSubmitting || loading ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Guardando...</span>
            </div>
          ) : (
            <span>{mantenimiento ? 'Actualizar mantenimiento' : 'Registrar mantenimiento'}</span>
          )}
        </button>
      </div>
    </form>
  );
}