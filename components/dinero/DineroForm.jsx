// components/dinero/DineroForm.jsx - SISTEMA DE FLETES - VERSIÓN MEJORADA
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCamiones } from '../../hooks/useCamiones';
import { useDinero } from '../../hooks/useDinero';

export default function DineroForm({ 
  tipo = 'GASTO', // 'GASTO' o 'INGRESO'
  movimiento = null, // Para edición
  onSave, 
  onCancel, 
  loading = false 
}) {
  const { camiones, getCamiones } = useCamiones(false);
  
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0], // Hoy por defecto
    nombre: '',
    descripcion: '',
    total: '',
    observaciones: '',
    camion_id: '',
    categoria_id: '',
    esGastoGeneral: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescripcion, setShowDescripcion] = useState(false);

  const { getCategorias } = useDinero(false);
  const [categorias, setCategorias] = useState([]);

  // ✅ CARGAR DATOS INICIALES
  useEffect(() => {
    getCamiones();
    
    if (movimiento) {
      setFormData({
        fecha: movimiento.fecha ? new Date(movimiento.fecha).toISOString().split('T')[0] : '',
        nombre: movimiento.nombre || '',
        descripcion: movimiento.descripcion || '',
        total: movimiento.total?.toString() || '',
        observaciones: movimiento.observaciones || '',
        camion_id: movimiento.camion_id?.toString() || '',
        categoria_id: movimiento.categoria_id?.toString() || '',
        esGastoGeneral: !movimiento.camion_id
      });
      setShowDescripcion(!!movimiento.descripcion);
    }
  }, [movimiento]);

  useEffect(() => {
    const loadCategorias = async () => {
      const result = await getCategorias(tipo);
      if (result.success) {
        setCategorias(result.data);
      }
    };
    
    loadCategorias();
  }, [tipo]);

  // ✅ MANEJAR CAMBIOS EN EL FORMULARIO
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (name === 'total') {
      // Permitir solo números y punto decimal
      processedValue = value.replace(/[^0-9.]/g, '');
      // Evitar múltiples puntos
      const parts = processedValue.split('.');
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('');
      }
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

    // Lógica especial para campos dependientes
    if (name === 'esGastoGeneral') {
      if (checked) {
        setFormData(prev => ({ ...prev, camion_id: '' }));
      }
    }

    if (name === 'categoria_id') {
      const categoria = categorias.find(c => c.id.toString() === value);
      if (categoria && categoria.nombre === 'OTROS') {
        setShowDescripcion(true);
      } else {
        setShowDescripcion(false);
        setFormData(prev => ({ ...prev, descripcion: '' }));
      }
    }
  }, [errors, categorias]);

  // ✅ VALIDACIÓN DEL FORMULARIO
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Campos requeridos
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.total.trim()) {
      newErrors.total = 'El monto es requerido';
    } else {
      const monto = parseFloat(formData.total);
      if (isNaN(monto) || monto <= 0) {
        newErrors.total = 'El monto debe ser mayor a 0';
      } else if (tipo === 'GASTO' && monto > 500000) {
        newErrors.total = 'El monto no puede superar $500,000';
      } else if (tipo === 'INGRESO' && monto > 1000000) {
        newErrors.total = 'El monto no puede superar $1,000,000';
      }
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    } else {
      const fechaSeleccionada = new Date(formData.fecha);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      
      if (fechaSeleccionada > hoy) {
        newErrors.fecha = 'La fecha no puede ser futura';
      }
      
      const unAñoAtras = new Date();
      unAñoAtras.setFullYear(unAñoAtras.getFullYear() - 1);
      
      if (fechaSeleccionada < unAñoAtras) {
        newErrors.fecha = 'La fecha no puede ser anterior a un año';
      }
    }

    if (!formData.categoria_id) {
      newErrors.categoria_id = 'Seleccione una categoría';
    }

    // Si seleccionó "OTROS", descripción es obligatoria
    const categoriaSeleccionada = categorias.find(c => c.id.toString() === formData.categoria_id);
    if (categoriaSeleccionada && categoriaSeleccionada.nombre === 'OTROS' && !formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida para "Otros"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, tipo, categorias]);

  // ✅ ENVIAR FORMULARIO - CORREGIDO PARA GASTOS GENERALES
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ PREPARAR DATOS PARA ENVÍO - CORRIGIENDO EL BUG
      const dataToSend = {
        fecha: formData.fecha,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        total: parseFloat(formData.total),
        observaciones: formData.observaciones.trim() || null,
        // ✅ FIX: Si esGastoGeneral es true O camion_id está vacío, enviar null
        camion_id: (formData.esGastoGeneral || !formData.camion_id) ? null : parseInt(formData.camion_id),
        categoria_id: parseInt(formData.categoria_id)
      };

      console.log('📤 Enviando datos:', dataToSend);
      await onSave(dataToSend);
    } catch (error) {
      console.error('Error en formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSave]);

  // ✅ VALIDACIÓN DE FORMULARIO
  const isFormValid = useMemo(() => {
    return formData.nombre.trim().length > 0 &&
           formData.total.trim().length > 0 &&
           parseFloat(formData.total) > 0 &&
           formData.fecha &&
           formData.categoria_id &&
           (!showDescripcion || formData.descripcion.trim().length > 0);
  }, [formData, showDescripcion]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Header del formulario - MEJORADO PARA MÓVIL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {movimiento ? `Editar ${tipo}` : `Registrar ${tipo}`}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            {tipo === 'GASTO' ? 'Registre un gasto de su negocio' : 'Registre un ingreso de su negocio'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="self-end sm:self-auto text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Cerrar formulario"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Información básica - MEJORADO GRID RESPONSIVE */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información básica</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Fecha */}
          <div className="sm:col-span-1">
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                errors.fecha ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting || loading}
            />
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>
            )}
          </div>

          {/* Monto */}
          <div className="sm:col-span-1">
            <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-2">
              Monto * ($)
            </label>
            <input
              type="text"
              id="total"
              name="total"
              value={formData.total}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                errors.total ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: 15000"
              disabled={isSubmitting || loading}
            />
            {errors.total && (
              <p className="mt-1 text-sm text-red-600">{errors.total}</p>
            )}
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Ingrese solo números. Máximo: ${tipo === 'GASTO' ? '500,000' : '1,000,000'}
            </p>
          </div>

          {/* Nombre/Concepto - FULL WIDTH EN MÓVIL */}
          <div className="sm:col-span-2">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Concepto *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                errors.nombre ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={tipo === 'GASTO' ? 'Ej: Carga de combustible YPF' : 'Ej: Viaje Buenos Aires - Córdoba'}
              disabled={isSubmitting || loading}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>
        </div>
      </div>

      {/* Categorización */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Categorización</h3>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Categoría */}
          <div>
            <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                errors.categoria_id ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting || loading}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            {errors.categoria_id && (
              <p className="mt-1 text-sm text-red-600">{errors.categoria_id}</p>
            )}
          </div>

          {/* Descripción adicional (solo si es "OTROS") */}
          {showDescripcion && (
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows="3"
                value={formData.descripcion}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                  errors.descripcion ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describa el gasto o ingreso..."
                disabled={isSubmitting || loading}
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Asociación con camión - MEJORADO */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Asociación con camión (opcional)</h3>
        
        <div className="space-y-4">
          {/* Checkbox para gasto general - MEJORADO PARA MÓVIL */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="esGastoGeneral"
              name="esGastoGeneral"
              checked={formData.esGastoGeneral}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              disabled={isSubmitting || loading}
            />
            <label htmlFor="esGastoGeneral" className="text-sm text-gray-700 leading-5">
              Es un {tipo.toLowerCase()} general (no asociado a un camión específico)
            </label>
          </div>

          {/* Selector de camión */}
          {!formData.esGastoGeneral && (
            <div>
              <label htmlFor="camion_id" className="block text-sm font-medium text-gray-700 mb-2">
                Camión (recomendado)
              </label>
              <select
                id="camion_id"
                name="camion_id"
                value={formData.camion_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                disabled={isSubmitting || loading}
              >
                <option value="">Seleccione un camión</option>
                {camiones.filter(c => c.activo).map(camion => (
                  <option key={camion.id} value={camion.id}>
                    {camion.patente} - {camion.marca} {camion.modelo}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Seleccionar un camión ayuda a generar mejores reportes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información adicional</h3>
        
        <div>
          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            rows="3"
            value={formData.observaciones}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            placeholder="Información adicional, número de factura, etc..."
            disabled={isSubmitting || loading}
          />
        </div>
      </div>

      {/* Botones de acción - MEJORADOS PARA MÓVIL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm sm:text-base"
          disabled={isSubmitting || loading}
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting || loading || !isFormValid}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            isSubmitting || loading || !isFormValid
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : tipo === 'GASTO'
                ? 'bg-red-600 hover:bg-red-700 text-white transform hover:scale-105'
                : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
          }`}
        >
          {isSubmitting || loading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Guardando...</span>
            </div>
          ) : (
            <span>{movimiento ? `Actualizar ${tipo.toLowerCase()}` : `Registrar ${tipo.toLowerCase()}`}</span>
          )}
        </button>
      </div>
    </form>
  );
}