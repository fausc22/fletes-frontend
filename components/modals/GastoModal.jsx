// components/modals/GastoModal.jsx - Modal responsivo para agregar gastos rápidamente
import { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';
import { toast } from 'react-hot-toast';
import { useGastos } from '../../hooks/useGastos';
import 'react-responsive-modal/styles.css';

export default function GastoModal({ viaje, isOpen, onClose, onGastoCreated }) {
  const { createGasto, getCategorias, categorias, loading } = useGastos(false);
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    categoria_id: '',
    descripcion: '',
    total: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: ''
  });

  // Categorías comunes para viajes
  const categoriasRapidas = [
    { id: 'combustible', nombre: 'Combustible', icon: '⛽' },
    { id: 'peaje', nombre: 'Peajes', icon: '🛣️' },
    { id: 'comida', nombre: 'Comida', icon: '🍽️' },
    { id: 'hotel', nombre: 'Alojamiento', icon: '🏨' },
    { id: 'reparacion', nombre: 'Reparación', icon: '🔧' },
    { id: 'otro', nombre: 'Otro', icon: '📝' }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && viaje) {
      // Reset form when modal opens
      setFormData({
        categoria_id: '',
        descripcion: '',
        total: '',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: ''
      });
      
      // Load categories
      getCategorias();
    }
  }, [isOpen, viaje]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoriaRapida = (categoriaRapida) => {
    setFormData(prev => ({
      ...prev,
      descripcion: `${categoriaRapida.nombre} - Viaje ${viaje?.patente}`,
      // Si tenemos categorías del backend, intentar hacer match
      categoria_id: categorias.find(c => 
        c.nombre.toLowerCase().includes(categoriaRapida.id.toLowerCase())
      )?.id || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.total || !formData.descripcion) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    if (parseFloat(formData.total) <= 0) {
      toast.error('El monto debe ser mayor a cero');
      return;
    }

    try {
      const gastoData = {
        camion_id: viaje.camion_id,
        viaje_id: viaje.id,
        categoria_id: formData.categoria_id || null,
        descripcion: formData.descripcion,
        total: parseFloat(formData.total),
        fecha: formData.fecha,
        observaciones: formData.observaciones || null
      };

      const result = await createGasto(gastoData);

      if (result.success) {
        toast.success('Gasto registrado exitosamente');
        onGastoCreated && onGastoCreated(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creando gasto:', error);
    }
  };

  if (!mounted || !viaje) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{
        modal: 'rounded-xl max-w-2xl w-full mx-4',
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
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Agregar Gasto al Viaje
          </h2>
          <p className="text-gray-600">
            {viaje.patente} - {viaje.ruta_nombre || 'Destino personalizado'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Categorías rápidas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Gasto (selección rápida)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categoriasRapidas.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() => handleCategoriaRapida(categoria)}
                  className={`p-3 rounded-lg border-2 transition-all text-center hover:border-blue-300 hover:bg-blue-50 ${
                    formData.descripcion.includes(categoria.nombre)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{categoria.icon}</div>
                  <div className="text-sm font-medium text-gray-700">
                    {categoria.nombre}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Ej: Combustible YPF - Viaje ABC123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Monto y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  value={formData.total}
                  onChange={(e) => handleInputChange('total', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Categoría del backend si están disponibles */}
          {categorias.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría (opcional)
              </label>
              <select
                value={formData.categoria_id}
                onChange={(e) => handleInputChange('categoria_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Detalles adicionales del gasto..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Información del viaje */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Información del Viaje</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-700">
              <p><strong>Camión:</strong> {viaje.patente}</p>
              <p><strong>Días en viaje:</strong> {Math.ceil((new Date() - new Date(viaje.fecha_inicio)) / (1000 * 60 * 60 * 24))}</p>
              <p><strong>Ruta:</strong> {viaje.ruta_nombre || 'Personalizada'}</p>
              <p><strong>ID Viaje:</strong> #{viaje.id}</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <span>Registrar Gasto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}