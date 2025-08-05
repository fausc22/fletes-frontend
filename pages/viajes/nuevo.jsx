// pages/viajes/nuevo.jsx - CREAR NUEVO VIAJE SIMPLIFICADO
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useCamiones } from '../../hooks/useCamiones';
import { useRutas } from '../../hooks/useRutas';
import { useViajes } from '../../hooks/useViajes';

export default function NuevoViaje() {
  const router = useRouter();
  const { getCamionesDisponibles, camiones } = useCamiones(false);
  const { getRutasActivas, rutas } = useRutas(false);
  const { createViaje, loading: loadingViaje } = useViajes(false);

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    camion_id: '',
    ruta_id: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    km_inicial: '',
    observaciones: '',
    destino_personalizado: ''
  });

  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([
          getCamionesDisponibles(),
          getRutasActivas()
        ]);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error cargando datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    initData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-completar km inicial cuando se selecciona camión
    if (field === 'camion_id' && value) {
      const camionSeleccionado = camiones.find(c => c.id == value);
      if (camionSeleccionado) {
        setFormData(prev => ({ 
          ...prev, 
          km_inicial: camionSeleccionado.kilometros.toString()
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.camion_id || !formData.fecha_inicio || !formData.km_inicial) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    if (parseInt(formData.km_inicial) < 0) {
      toast.error('El kilometraje inicial no puede ser negativo');
      return;
    }

    try {
      const result = await createViaje({
        camion_id: parseInt(formData.camion_id),
        ruta_id: formData.ruta_id ? parseInt(formData.ruta_id) : null,
        fecha_inicio: formData.fecha_inicio,
        km_inicial: parseInt(formData.km_inicial),
        observaciones: formData.observaciones || null
      });

      if (result.success) {
        toast.success('¡Viaje iniciado exitosamente!');
        router.push('/viajes/activos');
      }
    } catch (error) {
      console.error('Error iniciando viaje:', error);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.camion_id) {
      toast.error('Seleccione un camión');
      return;
    }
    if (step === 2 && !formData.fecha_inicio) {
      toast.error('Seleccione una fecha');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-green-800">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6">
      <Head>
        <title>NUEVO VIAJE | SISTEMA DE FLETES</title>
        <meta name="description" content="Iniciar un nuevo viaje de flete" />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">INICIAR NUEVO VIAJE</h1>
                <p className="text-green-100">Complete los datos para comenzar el viaje</p>
              </div>
            </div>
            <Link href="/viajes" className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
              ← Volver
            </Link>
          </div>
        </div>

        {/* Indicador de pasos */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  step >= stepNum 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNum}
                </div>
                <div className="ml-3 text-sm">
                  <p className={`font-medium ${step >= stepNum ? 'text-green-600' : 'text-gray-500'}`}>
                    {stepNum === 1 && 'Seleccionar Camión'}
                    {stepNum === 2 && 'Fecha y Ruta'}
                    {stepNum === 3 && 'Confirmar Datos'}
                  </p>
                </div>
                {stepNum < 3 && (
                  <div className={`w-8 h-1 mx-4 ${step > stepNum ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulario por pasos */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            
            {/* PASO 1: Seleccionar Camión */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Paso 1: Seleccionar Camión</h2>
                
                {camiones.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                      <circle cx="7" cy="19" r="2"/>
                      <circle cx="17" cy="19" r="2"/>
                    </svg>
                    <p className="text-lg text-gray-500 mb-2">No hay camiones disponibles</p>
                    <p className="text-sm text-gray-400 mb-4">Todos los camiones están en viaje o inactivos</p>
                    <Link href="/camiones" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Ver Camiones
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {camiones.map((camion) => (
                      <div
                        key={camion.id}
                        onClick={() => handleInputChange('camion_id', camion.id)}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                          formData.camion_id == camion.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                            formData.camion_id == camion.id
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                              <circle cx="7" cy="19" r="2"/>
                              <circle cx="17" cy="19" r="2"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800">{camion.patente}</h3>
                            <p className="text-gray-600">{camion.marca} {camion.modelo}</p>
                            <p className="text-sm text-gray-500">{camion.kilometros?.toLocaleString()} km</p>
                          </div>
                          {formData.camion_id == camion.id && (
                            <div className="text-green-500">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.camion_id}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: Fecha y Ruta */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Paso 2: Fecha y Ruta</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fecha de inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                      required
                    />
                  </div>

                  {/* Kilometraje inicial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kilometraje inicial *
                    </label>
                    <input
                      type="number"
                      value={formData.km_inicial}
                      onChange={(e) => handleInputChange('km_inicial', e.target.value)}
                      placeholder="Km actuales del camión"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                      required
                    />
                  </div>
                </div>

                {/* Selección de ruta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruta (opcional)
                  </label>
                  <select
                    value={formData.ruta_id}
                    onChange={(e) => handleInputChange('ruta_id', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  >
                    <option value="">Seleccionar ruta existente (opcional)</option>
                    {rutas.map((ruta) => (
                      <option key={ruta.id} value={ruta.id}>
                        {ruta.nombre} - {ruta.origen} → {ruta.destino}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    placeholder="Detalles del viaje, destino, carga, etc."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  />
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: Confirmar */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Paso 3: Confirmar Datos</h2>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen del Viaje</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Camión Seleccionado</h4>
                      {(() => {
                        const camionSeleccionado = camiones.find(c => c.id == formData.camion_id);
                        return camionSeleccionado ? (
                          <div className="bg-white p-4 rounded-lg border">
                            <p className="font-bold text-lg">{camionSeleccionado.patente}</p>
                            <p className="text-gray-600">{camionSeleccionado.marca} {camionSeleccionado.modelo}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Detalles del Viaje</h4>
                      <div className="bg-white p-4 rounded-lg border space-y-2">
                        <p><strong>Fecha:</strong> {new Date(formData.fecha_inicio).toLocaleDateString('es-AR')}</p>
                        <p><strong>Km inicial:</strong> {parseInt(formData.km_inicial).toLocaleString()}</p>
                        {formData.ruta_id && (
                          <p><strong>Ruta:</strong> {rutas.find(r => r.id == formData.ruta_id)?.nombre}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {formData.observaciones && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Observaciones</h4>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-gray-800">{formData.observaciones}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="submit"
                    disabled={loadingViaje}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loadingViaje ? 'Iniciando...' : '🚀 Iniciar Viaje'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}