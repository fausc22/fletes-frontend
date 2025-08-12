// pages/viajes/nuevo.jsx - CREAR NUEVO VIAJE MEJORADO Y RESPONSIVO
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

  // ✅ NUEVA FUNCIÓN: Obtener información de la ruta seleccionada
  const getRutaSeleccionada = () => {
    if (!formData.ruta_id) return null;
    return rutas.find(r => r.id == formData.ruta_id);
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
        {/* Header responsive */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">INICIAR NUEVO VIAJE</h1>
                <p className="text-green-100 text-sm sm:text-base">Complete los datos para comenzar el viaje</p>
              </div>
            </div>
            <Link href="/viajes" className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all text-center">
              ← Volver
            </Link>
          </div>
        </div>

        {/* Indicador de pasos - Responsive */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8 overflow-x-auto">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-shrink-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all ${
                  step >= stepNum 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNum}
                </div>
                <div className="ml-2 sm:ml-3 text-xs sm:text-sm">
                  <p className={`font-medium ${step >= stepNum ? 'text-green-600' : 'text-gray-500'}`}>
                    {stepNum === 1 && 'Seleccionar Camión'}
                    {stepNum === 2 && 'Fecha y Ruta'}
                    {stepNum === 3 && 'Confirmar Datos'}
                  </p>
                </div>
                {stepNum < 3 && (
                  <div className={`w-6 sm:w-8 h-1 mx-2 sm:mx-4 ${step > stepNum ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulario por pasos */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <form onSubmit={handleSubmit}>
            
            {/* PASO 1: Seleccionar Camión */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Paso 1: Seleccionar Camión</h2>
                
                {camiones.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                      <circle cx="7" cy="19" r="2"/>
                      <circle cx="17" cy="19" r="2"/>
                    </svg>
                    <p className="text-base sm:text-lg text-gray-500 mb-2">No hay camiones disponibles</p>
                    <p className="text-sm text-gray-400 mb-4">Todos los camiones están en viaje o inactivos</p>
                    <Link href="/camiones" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Ver Camiones
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {camiones.map((camion) => (
                      <div
                        key={camion.id}
                        onClick={() => handleInputChange('camion_id', camion.id)}
                        className={`border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg ${
                          formData.camion_id == camion.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ${
                            formData.camion_id == camion.id
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                              <circle cx="7" cy="19" r="2"/>
                              <circle cx="17" cy="19" r="2"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{camion.patente}</h3>
                            <p className="text-gray-600 text-sm sm:text-base truncate">{camion.marca} {camion.modelo}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{camion.kilometros?.toLocaleString()} km</p>
                          </div>
                          {formData.camion_id == camion.id && (
                            <div className="text-green-500 flex-shrink-0">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="bg-green-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: Fecha y Ruta */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Paso 2: Fecha y Ruta</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Fecha de inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base sm:text-lg"
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
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base sm:text-lg"
                      required
                    />
                  </div>
                </div>

                {/* Selección de ruta - Mejorada */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruta (opcional)
                  </label>
                  <select
                    value={formData.ruta_id}
                    onChange={(e) => handleInputChange('ruta_id', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base sm:text-lg"
                  >
                    <option value="">Seleccionar ruta existente (opcional)</option>
                    {rutas.map((ruta) => (
                      <option key={ruta.id} value={ruta.id}>
                        {ruta.nombre} - {ruta.origen} → {ruta.destino}
                        {ruta.km_estimados ? ` (${ruta.km_estimados} km)` : ''}
                        {ruta.precio_sugerido ? ` - $${ruta.precio_sugerido.toLocaleString()}` : ''}
                      </option>
                    ))}
                  </select>
                  
                  {/* Información de la ruta seleccionada */}
                  {getRutaSeleccionada() && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-medium text-blue-800 mb-2">📍 Información de la Ruta</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-blue-700">Origen:</span>
                          <p className="font-semibold">{getRutaSeleccionada().origen}</p>
                        </div>
                        <div>
                          <span className="text-blue-700">Destino:</span>
                          <p className="font-semibold">{getRutaSeleccionada().destino}</p>
                        </div>
                        {getRutaSeleccionada().km_estimados && (
                          <div>
                            <span className="text-blue-700">Km Estimados:</span>
                            <p className="font-semibold">{getRutaSeleccionada().km_estimados.toLocaleString()} km</p>
                          </div>
                        )}
                        {getRutaSeleccionada().precio_sugerido && (
                          <div>
                            <span className="text-blue-700">Precio Sugerido:</span>
                            <p className="font-semibold text-green-600">${getRutaSeleccionada().precio_sugerido.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      {getRutaSeleccionada().tiempo_estimado_horas && (
                        <div className="mt-2 text-sm text-blue-700">
                          <span className="font-medium">Tiempo estimado:</span> {getRutaSeleccionada().tiempo_estimado_horas} horas
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    placeholder="Detalles del viaje, destino específico, tipo de carga, etc."
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base sm:text-lg"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-green-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: Confirmar */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Paso 3: Confirmar Datos</h2>
                
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">📋 Resumen del Viaje</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">🚛 Camión Seleccionado</h4>
                      {(() => {
                        const camionSeleccionado = camiones.find(c => c.id == formData.camion_id);
                        return camionSeleccionado ? (
                          <div className="bg-white p-3 sm:p-4 rounded-lg border">
                            <p className="font-bold text-base sm:text-lg">{camionSeleccionado.patente}</p>
                            <p className="text-gray-600">{camionSeleccionado.marca} {camionSeleccionado.modelo}</p>
                            <p className="text-sm text-gray-500">Km actuales: {camionSeleccionado.kilometros?.toLocaleString()}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">📅 Detalles del Viaje</h4>
                      <div className="bg-white p-3 sm:p-4 rounded-lg border space-y-2">
                        <p><strong>Fecha:</strong> {new Date(formData.fecha_inicio).toLocaleDateString('es-AR')}</p>
                        <p><strong>Km inicial:</strong> {parseInt(formData.km_inicial).toLocaleString()}</p>
                        {formData.ruta_id ? (
                          <p><strong>Ruta:</strong> {rutas.find(r => r.id == formData.ruta_id)?.nombre}</p>
                        ) : (
                          <p><strong>Ruta:</strong> <span className="text-gray-500">Destino personalizado</span></p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información de la ruta seleccionada en resumen */}
                  {getRutaSeleccionada() && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-medium text-blue-800 mb-2">🗺️ Información de Ruta</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-blue-700">Recorrido:</span>
                          <p className="font-semibold">{getRutaSeleccionada().origen} → {getRutaSeleccionada().destino}</p>
                        </div>
                        {getRutaSeleccionada().km_estimados && (
                          <div>
                            <span className="text-blue-700">Distancia estimada:</span>
                            <p className="font-semibold">{getRutaSeleccionada().km_estimados.toLocaleString()} km</p>
                          </div>
                        )}
                        {getRutaSeleccionada().precio_sugerido && (
                          <div>
                            <span className="text-blue-700">Ingreso estimado:</span>
                            <p className="font-semibold text-green-600">${getRutaSeleccionada().precio_sugerido.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      {getRutaSeleccionada().tiempo_estimado_horas && (
                        <div className="mt-2 text-sm">
                          <span className="text-blue-700">Duración estimada:</span>
                          <span className="font-semibold ml-1">{getRutaSeleccionada().tiempo_estimado_horas} horas</span>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.observaciones && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">📝 Observaciones</h4>
                      <div className="bg-white p-3 sm:p-4 rounded-lg border">
                        <p className="text-gray-800">{formData.observaciones}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Información importante */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div>
                      <h4 className="font-bold text-green-800 mb-1">✅ Listo para Iniciar</h4>
                      <p className="text-green-700 text-sm">
                        Al confirmar, el viaje se iniciará automáticamente y el camión quedará marcado como "en viaje". 
                        Podrá registrar gastos durante el trayecto y finalizar el viaje cuando llegue al destino.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="submit"
                    disabled={loadingViaje}
                    className="bg-green-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    {loadingViaje ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Iniciando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                        </svg>
                        <span>🚀 Iniciar Viaje</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Consejos útiles - Responsive */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 sm:p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg flex-shrink-0 self-center sm:self-start">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-2">💡 Consejos para el Nuevo Viaje</h3>
              <ul className="space-y-1 text-blue-100 text-sm sm:text-base">
                <li>• <strong>Rutas predefinidas:</strong> Usar rutas existentes proporciona estimaciones automáticas de costos y tiempos</li>
                <li>• <strong>Kilometraje:</strong> Verifique que el kilometraje inicial coincida con el odómetro actual del camión</li>
                <li>• <strong>Observaciones:</strong> Incluya detalles sobre la carga, destino específico o instrucciones especiales</li>
                <li>• <strong>Seguimiento:</strong> Una vez iniciado, podrá registrar gastos y monitorear el progreso del viaje</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Información de rutas disponibles si no hay ninguna seleccionada */}
        {rutas.length > 0 && !formData.ruta_id && step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">🗺️ Rutas Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rutas.slice(0, 6).map((ruta) => (
                <div 
                  key={ruta.id}
                  onClick={() => handleInputChange('ruta_id', ruta.id)}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
                >
                  <h4 className="font-semibold text-gray-800 mb-1">{ruta.nombre}</h4>
                  <p className="text-sm text-gray-600 mb-2">{ruta.origen} → {ruta.destino}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    {ruta.km_estimados && <span>{ruta.km_estimados} km</span>}
                    {ruta.precio_sugerido && <span className="text-green-600 font-medium">${ruta.precio_sugerido.toLocaleString()}</span>}
                  </div>
                </div>
              ))}
            </div>
            {rutas.length > 6 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Y {rutas.length - 6} rutas más disponibles en el selector
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}