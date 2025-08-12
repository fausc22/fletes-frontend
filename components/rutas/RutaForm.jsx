// components/rutas/RutaForm.jsx - SISTEMA DE FLETES
import { useState, useEffect, useCallback, useMemo } from 'react';

export default function RutaForm({ 
  ruta = null, 
  onSave, 
  onCancel, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    origen: '',
    destino: '',
    distancia_km: '',
    tiempo_estimado_horas: '',
    activo: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ MEMOIZAR DATOS INICIALES PARA EVITAR RE-RENDERS
  const initialData = useMemo(() => {
    if (ruta) {
      return {
        nombre: ruta.nombre || '',
        origen: ruta.origen || '',
        destino: ruta.destino || '',
        distancia_km: ruta.distancia_km?.toString() || '',
        tiempo_estimado_horas: ruta.tiempo_estimado_horas?.toString() || '',
        activo: ruta.activo !== 0
      };
    }
    return {
      nombre: '',
      origen: '',
      destino: '',
      distancia_km: '',
      tiempo_estimado_horas: '',
      activo: true
    };
  }, [ruta]);

  // ✅ CARGAR DATOS SOLO CUANDO CAMBIA LA RUTA
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
    } else if (name === 'distancia_km' || name === 'tiempo_estimado_horas') {
      // Permitir números decimales
      processedValue = value.replace(/[^0-9.]/g, '');
      // Evitar múltiples puntos
      const parts = processedValue.split('.');
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('');
      }
    } else if (name === 'origen' || name === 'destino') {
      // Capitalizar primera letra de cada palabra
      processedValue = value.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
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

    // Auto-generar nombre si no existe
    if ((name === 'origen' || name === 'destino') && !formData.nombre) {
      const nuevoOrigen = name === 'origen' ? processedValue : formData.origen;
      const nuevoDestino = name === 'destino' ? processedValue : formData.destino;
      
      if (nuevoOrigen && nuevoDestino) {
        setFormData(prev => ({
          ...prev,
          nombre: `${nuevoOrigen} - ${nuevoDestino}`
        }));
      }
    }
  }, [errors, formData.nombre, formData.origen]);

  // ✅ MEMOIZAR FUNCIÓN DE VALIDACIÓN
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.origen.trim()) {
      newErrors.origen = 'El origen es requerido';
    }

    if (!formData.destino.trim()) {
      newErrors.destino = 'El destino es requerido';
    }

    // Validar que origen y destino sean diferentes
    if (formData.origen.trim() && formData.destino.trim() && 
        formData.origen.trim().toLowerCase() === formData.destino.trim().toLowerCase()) {
      newErrors.destino = 'El destino debe ser diferente al origen';
    }

    // Validar distancia si se proporciona
    if (formData.distancia_km) {
      const distancia = parseFloat(formData.distancia_km);
      if (isNaN(distancia) || distancia <= 0) {
        newErrors.distancia_km = 'La distancia debe ser un número positivo';
      } else if (distancia > 5000) {
        newErrors.distancia_km = 'La distancia no puede superar los 5,000 km';
      }
    }

    // Validar tiempo si se proporciona
    if (formData.tiempo_estimado_horas) {
      const tiempo = parseFloat(formData.tiempo_estimado_horas);
      if (isNaN(tiempo) || tiempo <= 0) {
        newErrors.tiempo_estimado_horas = 'El tiempo debe ser un número positivo';
      } else if (tiempo > 168) { // 7 días
        newErrors.tiempo_estimado_horas = 'El tiempo no puede superar las 168 horas (7 días)';
      }
    }

    // Validar coherencia entre distancia y tiempo
    if (formData.distancia_km && formData.tiempo_estimado_horas) {
      const distancia = parseFloat(formData.distancia_km);
      const tiempo = parseFloat(formData.tiempo_estimado_horas);
      const velocidadPromedio = distancia / tiempo;
      
      if (velocidadPromedio < 10) {
        newErrors.tiempo_estimado_horas = 'Velocidad muy baja. Revise distancia y tiempo';
      } else if (velocidadPromedio > 120) {
        newErrors.tiempo_estimado_horas = 'Velocidad muy alta. Revise distancia y tiempo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ✅ MEMOIZAR ESTADO DE VALIDACIÓN
  const isFormValid = useMemo(() => {
    return formData.nombre.trim().length > 0 &&
           formData.origen.trim().length > 0 &&
           formData.destino.trim().length > 0 &&
           formData.origen.trim().toLowerCase() !== formData.destino.trim().toLowerCase();
  }, [formData]);

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
        nombre: formData.nombre.trim(),
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        distancia_km: formData.distancia_km ? parseFloat(formData.distancia_km) : null,
        tiempo_estimado_horas: formData.tiempo_estimado_horas ? parseFloat(formData.tiempo_estimado_horas) : null,
        activo: formData.activo
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

  // ✅ CALCULAR VELOCIDAD PROMEDIO
  const getVelocidadPromedio = () => {
    if (!formData.distancia_km || !formData.tiempo_estimado_horas) return null;
    const distancia = parseFloat(formData.distancia_km);
    const tiempo = parseFloat(formData.tiempo_estimado_horas);
    if (isNaN(distancia) || isNaN(tiempo) || tiempo === 0) return null;
    return Math.round(distancia / tiempo);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header del formulario */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {ruta ? 'Editar Ruta' : 'Nueva Ruta'}
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
          {/* Origen */}
          <div>
            <label htmlFor="origen" className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad/Lugar de origen *
            </label>
            <input
              type="text"
              id="origen"
              name="origen"
              value={formData.origen}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.origen ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Buenos Aires, Córdoba"
              disabled={isSubmitting || loading}
            />
            {errors.origen && (
              <p className="mt-1 text-sm text-red-600">{errors.origen}</p>
            )}
          </div>

          {/* Destino */}
          <div>
            <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad/Lugar de destino *
            </label>
            <input
              type="text"
              id="destino"
              name="destino"
              value={formData.destino}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.destino ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Rosario, Mendoza"
              disabled={isSubmitting || loading}
            />
            {errors.destino && (
              <p className="mt-1 text-sm text-red-600">{errors.destino}</p>
            )}
          </div>
        </div>

        {/* Nombre de la ruta */}
        <div className="mt-6">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la ruta *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.nombre ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Se genera automáticamente o puede personalizarlo"
            disabled={isSubmitting || loading}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Se genera automáticamente al completar origen y destino
          </p>
        </div>
      </div>

      {/* Información técnica */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información técnica (opcional)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distancia */}
          <div>
            <label htmlFor="distancia_km" className="block text-sm font-medium text-gray-700 mb-2">
              Distancia (km)
            </label>
            <input
              type="text"
              id="distancia_km"
              name="distancia_km"
              value={formData.distancia_km}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.distancia_km ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: 350.5"
              disabled={isSubmitting || loading}
            />
            {errors.distancia_km && (
              <p className="mt-1 text-sm text-red-600">{errors.distancia_km}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Distancia aproximada del recorrido
            </p>
          </div>

          {/* Tiempo estimado */}
          <div>
            <label htmlFor="tiempo_estimado_horas" className="block text-sm font-medium text-gray-700 mb-2">
              Tiempo estimado (horas)
            </label>
            <input
              type="text"
              id="tiempo_estimado_horas"
              name="tiempo_estimado_horas"
              value={formData.tiempo_estimado_horas}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.tiempo_estimado_horas ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: 4.5"
              disabled={isSubmitting || loading}
            />
            {errors.tiempo_estimado_horas && (
              <p className="mt-1 text-sm text-red-600">{errors.tiempo_estimado_horas}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Tiempo estimado de viaje en horas
            </p>
          </div>
        </div>

        {/* Mostrar cálculo de velocidad promedio */}
        {getVelocidadPromedio() && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span className="text-sm font-medium text-blue-800">
                Velocidad promedio: {getVelocidadPromedio()} km/h
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {getVelocidadPromedio() < 30 && "⚠️ Velocidad muy baja - Verifique los datos"}
              {getVelocidadPromedio() >= 30 && getVelocidadPromedio() <= 80 && "✅ Velocidad apropiada para rutas de carga"}
              {getVelocidadPromedio() > 80 && "⚠️ Velocidad alta - Considere tiempos de descanso"}
            </p>
          </div>
        )}
      </div>

      {/* Estado activo (solo para edición) */}
      {ruta && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de la ruta</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={isSubmitting || loading}
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
              Ruta activa
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Las rutas inactivas no aparecerán en la selección de nuevos viajes
          </p>
          
          {ruta.total_viajes > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Esta ruta tiene {ruta.total_viajes} viaje{ruta.total_viajes !== 1 ? 's' : ''} registrado{ruta.total_viajes !== 1 ? 's' : ''}. 
                Si la desactiva, se mantendrá el historial pero no estará disponible para nuevos viajes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Consejos y sugerencias */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-800 mb-2">💡 Consejos para crear rutas</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Use nombres de ciudades o puntos de referencia conocidos</li>
              <li>• La distancia y tiempo ayudan a calcular costos y planificar viajes</li>
              <li>• Puede obtener distancias exactas de Google Maps o Waze</li>
              <li>• Considere tiempos de descanso y cargas en el tiempo estimado</li>
              <li>• Las rutas frecuentes mejoran la eficiencia del negocio</li>
            </ul>
          </div>
        </div>
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
              : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-105'
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
            <span>{ruta ? 'Actualizar ruta' : 'Crear ruta'}</span>
          )}
        </button>
      </div>
    </form>
  );
}