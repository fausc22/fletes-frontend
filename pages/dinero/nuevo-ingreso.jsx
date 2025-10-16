import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDinero } from '../../hooks/useDinero';
import { useCamiones } from '../../hooks/useCamiones';
import { toast } from 'react-hot-toast';
import Head from 'next/head';

export default function NuevoIngreso() {
  const router = useRouter();
  const { createIngreso, getCategorias, categorias, loading } = useDinero(false);
  const { camiones, loading: loadingCamiones } = useCamiones();
  
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0], // ✅ Fecha de hoy por defecto
    nombre: '',
    descripcion: '',
    total: '',
    observaciones: '',
    camion_id: '',
    categoria_id: ''
  });

  const [errors, setErrors] = useState({});

  // Cargar categorías de INGRESO al montar
  useEffect(() => {
    getCategorias('INGRESO');
  }, []);

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'La descripción es obligatoria';
    }

    if (!formData.total || parseFloat(formData.total) <= 0) {
      newErrors.total = 'El monto debe ser mayor a 0';
    }

    if (parseFloat(formData.total) > 1000000) {
      newErrors.total = 'El monto no puede superar $1,000,000';
    }

    const fechaIngreso = new Date(formData.fecha);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    
    if (fechaIngreso > hoy) {
      newErrors.fecha = 'La fecha no puede ser futura';
    }

    const unAñoAtras = new Date();
    unAñoAtras.setFullYear(unAñoAtras.getFullYear() - 1);
    
    if (fechaIngreso < unAñoAtras) {
      newErrors.fecha = 'La fecha no puede ser anterior a un año';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    // Preparar datos según el backend espera
    const ingresoData = {
      fecha: formData.fecha,
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || null,
      total: parseFloat(formData.total),
      observaciones: formData.observaciones.trim() || null,
      camion_id: formData.camion_id || null,
      categoria_id: formData.categoria_id || null
    };

    console.log('📤 Enviando ingreso:', ingresoData);

    const result = await createIngreso(ingresoData);

    if (result.success) {
      toast.success('✅ Ingreso registrado exitosamente');
      router.push('/dinero/balance');
    } else {
      toast.error(result.error || 'Error al registrar el ingreso');
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6">
      <Head>
        <title>Nuevo Ingreso | Sistema de Fletes</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                <span>Nuevo Ingreso</span>
              </h1>
              <p className="text-green-100">Registre un nuevo cobro o entrada de dinero</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
          
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => handleChange('fecha', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                errors.fecha ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {errors.fecha}
              </p>
            )}
          </div>

          {/* Descripción/Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Ingreso <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Flete cobrado - Cliente XYZ"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 text-xl font-bold">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.total}
                onChange={(e) => handleChange('total', e.target.value)}
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-xl font-semibold transition-all ${
                  errors.total ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.total && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {errors.total}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Monto ilimitado (sin restricciones)
            </p>
          </div>

          {/* Grid de 2 columnas para Camión y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Camión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camión <span className="text-gray-400">(Opcional)</span>
              </label>
              <select
                value={formData.camion_id}
                onChange={(e) => handleChange('camion_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loadingCamiones}
              >
                <option value="">Sin asignar</option>
                {camiones?.map(camion => (
                  <option key={camion.id} value={camion.id}>
                    {camion.patente} - {camion.marca} {camion.modelo}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría <span className="text-gray-400">(Opcional)</span>
              </label>
              <select
                value={formData.categoria_id}
                onChange={(e) => handleChange('categoria_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Sin categoría</option>
                {categorias?.filter(cat => cat.tipo === 'INGRESO').map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detalle/Descripción adicional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detalle Adicional <span className="text-gray-400">(Opcional)</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Información adicional sobre el ingreso..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones <span className="text-gray-400">(Opcional)</span>
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Notas o comentarios adicionales..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Información de ayuda */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">💡 Consejos:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Sea específico en la descripción para facilitar el seguimiento</li>
                  <li>Asigne un camión si el ingreso es específico de un vehículo</li>
                  <li>Use categorías para generar reportes más precisos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              ← Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                '💾 Guardar Ingreso'
              )}
            </button>
          </div>
        </form>

        {/* Preview del ingreso */}
        {formData.nombre && formData.total && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Vista Previa</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">{new Date(formData.fecha).toLocaleDateString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descripción:</span>
                <span className="font-medium">{formData.nombre}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-bold">TOTAL:</span>
                <span className="font-bold text-green-600 text-lg">
                  ${parseFloat(formData.total || 0).toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}