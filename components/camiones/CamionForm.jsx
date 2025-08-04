// components/camiones/CamionForm.jsx - SISTEMA DE FLETES - CORREGIDO PARA EVITAR RE-RENDERS
import { useState, useEffect, useCallback, useMemo } from 'react';

export default function CamionForm({ 
  camion = null, 
  onSave, 
  onCancel, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    kilometros: 0,
    patente: '',
    ultimo_service: '',
    activo: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ MEMOIZAR DATOS INICIALES PARA EVITAR RE-RENDERS
  const initialData = useMemo(() => {
    if (camion) {
      return {
        marca: camion.marca || '',
        modelo: camion.modelo || '',
        año: camion.año || new Date().getFullYear(),
        kilometros: camion.kilometros || 0,
        patente: camion.patente || '',
        ultimo_service: camion.ultimo_service ? 
          new Date(camion.ultimo_service).toISOString().split('T')[0] : '',
        activo: camion.activo !== 0
      };
    }
    return {
      marca: '',
      modelo: '',
      año: new Date().getFullYear(),
      kilometros: 0,
      patente: '',
      ultimo_service: '',
      activo: true
    };
  }, [camion]);

  // ✅ CARGAR DATOS SOLO CUANDO CAMBIA EL CAMIÓN
  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  // ✅ MEMOIZAR FUNCIÓN DE CAMBIO PARA EVITAR RE-RENDERS
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // Procesar según el tipo de campo
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (name === 'año' || name === 'kilometros') {
      processedValue = value === '' ? '' : parseInt(value) || 0;
    } else if (name === 'patente') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
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

  // ✅ MEMOIZAR FUNCIÓN DE VALIDACIÓN
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es requerida';
    }

    if (!formData.modelo.trim()) {
      newErrors.modelo = 'El modelo es requerido';
    }

    if (!formData.patente.trim()) {
      newErrors.patente = 'La patente es requerida';
    } else if (formData.patente.length < 6) {
      newErrors.patente = 'La patente debe tener al menos 6 caracteres';
    }

    // Validar año
    const añoActual = new Date().getFullYear();
    if (!formData.año || formData.año < 1990 || formData.año > añoActual + 1) {
      newErrors.año = `El año debe estar entre 1990 y ${añoActual + 1}`;
    }

    // Validar kilómetros
    if (formData.kilometros < 0) {
      newErrors.kilometros = 'Los kilómetros no pueden ser negativos';
    }

    // Si estamos editando, validar que los km no sean menores a los actuales
    if (camion && formData.kilometros < camion.kilometros) {
      newErrors.kilometros = 'Los kilómetros no pueden ser menores a los actuales';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, camion]);

  // ✅ MEMOIZAR ESTADO DE VALIDACIÓN
  const isFormValid = useMemo(() => {
    return formData.marca.trim().length > 0 &&
           formData.modelo.trim().length > 0 &&
           formData.patente.trim().length >= 6 &&
           formData.año >= 1990 &&
           formData.año <= new Date().getFullYear() + 1 &&
           formData.kilometros >= 0 &&
           (!camion || formData.kilometros >= camion.kilometros);
  }, [formData, camion]);

  // ✅ MEMOIZAR FUNCIÓN DE ENVÍO
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para envío
      const dataToSend = {
        ...formData,
        ultimo_service: formData.ultimo_service || null
      };

      await onSave(dataToSend);
    } catch (error) {
      console.error('Error en formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSave]);

  // ✅ MEMOIZAR FUNCIÓN DE CANCELAR
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header del formulario */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {camion ? 'Editar Camión' : 'Nuevo Camión'}
        </h2>
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Marca */}
          <div>
            <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-2">
              Marca *
            </label>
            <input
              type="text"
              id="marca"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.marca ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Mercedes Benz, Volvo, Iveco"
              disabled={isSubmitting || loading}
            />
            {errors.marca && (
              <p className="mt-1 text-sm text-red-600">{errors.marca}</p>
            )}
          </div>

          {/* Modelo */}
          <div>
            <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 mb-2">
              Modelo *
            </label>
            <input
              type="text"
              id="modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.modelo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Atego, Daily, FH"
              disabled={isSubmitting || loading}
            />
            {errors.modelo && (
              <p className="mt-1 text-sm text-red-600">{errors.modelo}</p>
            )}
          </div>

          {/* Patente */}
          <div>
            <label htmlFor="patente" className="block text-sm font-medium text-gray-700 mb-2">
              Patente *
            </label>
            <input
              type="text"
              id="patente"
              name="patente"
              value={formData.patente}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.patente ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: ABC123, AB123CD"
              maxLength="8"
              disabled={isSubmitting || loading}
            />
            {errors.patente && (
              <p className="mt-1 text-sm text-red-600">{errors.patente}</p>
            )}
          </div>

          {/* Año */}
          <div>
            <label htmlFor="año" className="block text-sm font-medium text-gray-700 mb-2">
              Año *
            </label>
            <input
              type="number"
              id="año"
              name="año"
              value={formData.año}
              onChange={handleChange}
              min="1990"
              max={new Date().getFullYear() + 1}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.año ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting || loading}
            />
            {errors.año && (
              <p className="mt-1 text-sm text-red-600">{errors.año}</p>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información adicional</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kilómetros */}
          <div>
            <label htmlFor="kilometros" className="block text-sm font-medium text-gray-700 mb-2">
              Kilómetros actuales
            </label>
            <input
              type="number"
              id="kilometros"
              name="kilometros"
              value={formData.kilometros}
              onChange={handleChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.kilometros ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0"
              disabled={isSubmitting || loading}
            />
            {errors.kilometros && (
              <p className="mt-1 text-sm text-red-600">{errors.kilometros}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Kilómetros en el odómetro del camión
            </p>
          </div>

          {/* Último service */}
          <div>
            <label htmlFor="ultimo_service" className="block text-sm font-medium text-gray-700 mb-2">
              Último service
            </label>
            <input
              type="date"
              id="ultimo_service"
              name="ultimo_service"
              value={formData.ultimo_service}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting || loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Fecha del último mantenimiento realizado
            </p>
          </div>
        </div>

        {/* Estado activo (solo para edición) */}
        {camion && (
          <div className="mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting || loading || (camion && camion.tiene_viaje_activo)}
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                Camión activo
              </label>
            </div>
            {camion && camion.tiene_viaje_activo && (
              <p className="mt-1 text-sm text-yellow-600">
                No se puede desactivar un camión con viajes en curso
              </p>
            )}
          </div>
        )}
      </div>

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
              : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
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
            <span>{camion ? 'Actualizar camión' : 'Crear camión'}</span>
          )}
        </button>
      </div>
    </form>
  );
}