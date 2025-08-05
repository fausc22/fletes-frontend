// pages/viajes/finalizar/[id].jsx - FINALIZAR VIAJE ESPECÍFICO
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useViajes } from '../../../hooks/useViajes';

export default function FinalizarViaje() {
  const router = useRouter();
  const { id } = router.query;
  const { getViajeById, finalizarViaje, loading } = useViajes(false);

  const [mounted, setMounted] = useState(false);
  const [viaje, setViaje] = useState(null);
  const [loadingViaje, setLoadingViaje] = useState(true);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    fecha_fin: new Date().toISOString().split('T')[0],
    km_final: '',
    observaciones_finales: '',
    crear_ingreso_automatico: true,
    monto_cobrado: '',
    descripcion_ingreso: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    loadViaje();
  }, [mounted, id]);

  const loadViaje = async () => {
    try {
      setLoadingViaje(true);
      const result = await getViajeById(id);
      
      if (result.success) {
        setViaje(result.data);
        
        // Auto-completar campos
        setFormData(prev => ({
          ...prev,
          km_final: result.data.km_actuales_camion?.toString() || '',
          descripcion_ingreso: `Flete - Viaje ${result.data.patente} (${result.data.ruta_nombre || 'Destino personalizado'})`
        }));
      } else {
        toast.error('Error cargando datos del viaje');
        router.push('/viajes/activos');
      }
    } catch (error) {
      console.error('Error cargando viaje:', error);
      toast.error('Error cargando datos del viaje');
    } finally {
      setLoadingViaje(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calcularKmRecorridos = () => {
    if (!viaje || !formData.km_final) return 0;
    return Math.max(0, parseInt(formData.km_final) - viaje.km_inicial);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.fecha_fin || !formData.km_final) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    if (parseInt(formData.km_final) < viaje.km_inicial) {
      toast.error('El kilometraje final no puede ser menor al inicial');
      return;
    }

    if (formData.crear_ingreso_automatico && (!formData.monto_cobrado || formData.monto_cobrado <= 0)) {
      toast.error('Ingrese el monto cobrado para registrar el ingreso automático');
      return;
    }

    try {
      const datosFinales = {
        fecha_fin: formData.fecha_fin,
        km_final: parseInt(formData.km_final),
        observaciones_finales: formData.observaciones_finales || null,
        crear_ingreso_automatico: formData.crear_ingreso_automatico,
        monto_cobrado: formData.crear_ingreso_automatico ? parseFloat(formData.monto_cobrado) : null,
        descripcion_ingreso: formData.descripcion_ingreso || null
      };

      const result = await finalizarViaje(id, datosFinales);

      if (result.success) {
        toast.success('¡Viaje finalizado exitosamente!');
        
        // Mostrar información adicional del ingreso si se creó
        if (result.data.ingreso_creado) {
          setTimeout(() => {
            toast.success(`Ingreso de $${result.data.ingreso_creado.total.toLocaleString()} registrado automáticamente`);
          }, 1000);
        }
        
        router.push('/viajes');
      }
    } catch (error) {
      console.error('Error finalizando viaje:', error);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.fecha_fin || !formData.km_final)) {
      toast.error('Complete los campos obligatorios');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  if (!mounted) {
    return null;
  }

  if (loadingViaje) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-green-800">Cargando datos del viaje...</span>
      </div>
    );
  }

  if (!viaje) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Viaje no encontrado</h2>
          <p className="text-gray-600 mb-6">El viaje solicitado no existe o ya fue finalizado</p>
          <Link href="/viajes/activos" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Ver Viajes Activos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6">
      <Head>
        <title>FINALIZAR VIAJE | SISTEMA DE FLETES</title>
        <meta name="description" content="Finalizar viaje y registrar cobro" />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">FINALIZAR VIAJE</h1>
                <p className="text-green-100">
                  {viaje.patente} - {viaje.marca} {viaje.modelo}
                </p>
              </div>
            </div>
            <Link href="/viajes/activos" className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
              ← Volver
            </Link>
          </div>
        </div>

        {/* Información del viaje */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Viaje</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Fecha de Inicio</h3>
              <p className="text-lg font-bold text-blue-900">
                {new Date(viaje.fecha_inicio).toLocaleDateString('es-AR')}
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Kilometraje Inicial</h3>
              <p className="text-lg font-bold text-blue-900">
                {viaje.km_inicial?.toLocaleString()} km
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Días en Viaje</h3>
              <p className="text-lg font-bold text-blue-900">
                {viaje.dias_viaje} día{viaje.dias_viaje !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {viaje.ruta_nombre && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Ruta</h3>
              <p className="text-lg font-semibold text-gray-800">
                {viaje.ruta_nombre} ({viaje.origen} → {viaje.destino})
              </p>
            </div>
          )}

          {viaje.observaciones && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Observaciones del Inicio</h3>
              <p className="text-yellow-700">{viaje.observaciones}</p>
            </div>
          )}
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
                    {stepNum === 1 && 'Datos de Finalización'}
                    {stepNum === 2 && 'Registrar Cobro'}
                    {stepNum === 3 && 'Confirmar'}
                  </p>
                </div>
                {stepNum < 3 && (
                  <div className={`w-8 h-1 mx-4 ${step > stepNum ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            
            {/* PASO 1: Datos de finalización */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Paso 1: Datos de Finalización</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de finalización *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_fin}
                      onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kilometraje final *
                    </label>
                    <input
                      type="number"
                      value={formData.km_final}
                      onChange={(e) => handleInputChange('km_final', e.target.value)}
                      min={viaje.km_inicial}
                      placeholder={`Mínimo ${viaje.km_inicial?.toLocaleString()}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                      required
                    />
                  </div>
                </div>

                {/* Mostrar kilómetros recorridos */}
                {formData.km_final && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-green-800 mb-2">📏 Resumen del Recorrido</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Km inicial:</span>
                        <span className="font-bold ml-2">{viaje.km_inicial?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-green-700">Km final:</span>
                        <span className="font-bold ml-2">{parseInt(formData.km_final).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-green-700">Km recorridos:</span>
                        <span className="font-bold ml-2 text-lg">{calcularKmRecorridos().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones de finalización
                  </label>
                  <textarea
                    value={formData.observaciones_finales}
                    onChange={(e) => handleInputChange('observaciones_finales', e.target.value)}
                    placeholder="Detalles del final del viaje, estado de la carga, etc."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  />
                </div>
                
                <div className="flex justify-end">
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

            {/* PASO 2: Registrar cobro */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Paso 2: Registrar Cobro</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-800 mb-2">Registro Automático de Ingreso</h3>
                      <p className="text-blue-700">
                        Al finalizar el viaje, puede registrar automáticamente el cobro del flete. 
                        Esto creará un ingreso en el sistema vinculado a este viaje.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="crear_ingreso"
                      checked={formData.crear_ingreso_automatico}
                      onChange={(e) => handleInputChange('crear_ingreso_automatico', e.target.checked)}
                      className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="crear_ingreso" className="text-lg font-medium text-gray-700">
                      Registrar cobro del flete automáticamente
                    </label>
                  </div>

                  {formData.crear_ingreso_automatico && (
                    <div className="ml-8 space-y-4 border-l-4 border-green-200 pl-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto cobrado *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500 text-lg">$</span>
                            <input
                              type="number"
                              value={formData.monto_cobrado}
                              onChange={(e) => handleInputChange('monto_cobrado', e.target.value)}
                              placeholder="0"
                              min="0"
                              step="0.01"
                              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                              required={formData.crear_ingreso_automatico}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cálculo por kilómetro (referencia)
                          </label>
                          <div className="bg-gray-50 rounded-lg p-3">
                            {formData.monto_cobrado && calcularKmRecorridos() > 0 ? (
                              <p className="text-gray-700">
                                <span className="font-bold">
                                  ${(parseFloat(formData.monto_cobrado) / calcularKmRecorridos()).toFixed(2)}
                                </span> por kilómetro
                              </p>
                            ) : (
                              <p className="text-gray-500">Ingrese el monto para ver el cálculo</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción del ingreso
                        </label>
                        <input
                          type="text"
                          value={formData.descripcion_ingreso}
                          onChange={(e) => handleInputChange('descripcion_ingreso', e.target.value)}
                          placeholder="Descripción automática generada"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                        />
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Paso 3: Confirmar Finalización</h2>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">📋 Resumen de Finalización</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Información del viaje */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-bold text-gray-800 mb-3">Información del Viaje</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Camión:</span>
                          <span className="font-medium">{viaje.patente}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha inicio:</span>
                          <span className="font-medium">
                            {new Date(viaje.fecha_inicio).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha fin:</span>
                          <span className="font-medium">
                            {new Date(formData.fecha_fin).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duración:</span>
                          <span className="font-medium">
                            {Math.ceil((new Date(formData.fecha_fin) - new Date(viaje.fecha_inicio)) / (1000 * 60 * 60 * 24))} días
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Información del recorrido */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-bold text-gray-800 mb-3">Recorrido</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Km inicial:</span>
                          <span className="font-medium">{viaje.km_inicial?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Km final:</span>
                          <span className="font-medium">{parseInt(formData.km_final).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600 font-medium">Km recorridos:</span>
                          <span className="font-bold text-lg text-green-600">
                            {calcularKmRecorridos().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del cobro */}
                  {formData.crear_ingreso_automatico && formData.monto_cobrado && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h4 className="font-bold text-green-800 mb-3">💰 Ingreso a Registrar</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Monto:</span>
                          <span className="font-bold text-lg text-green-800">
                            ${parseFloat(formData.monto_cobrado).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Por km:</span>
                          <span className="font-medium text-green-800">
                            ${(parseFloat(formData.monto_cobrado) / calcularKmRecorridos()).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-green-700 text-sm">Descripción:</span>
                        <p className="font-medium text-green-800">{formData.descripcion_ingreso}</p>
                      </div>
                    </div>
                  )}

                  {/* Observaciones finales */}
                  {formData.observaciones_finales && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-blue-800 mb-2">📝 Observaciones Finales</h4>
                      <p className="text-blue-700">{formData.observaciones_finales}</p>
                    </div>
                  )}
                </div>

                {/* Advertencia importante */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <div>
                      <h4 className="font-bold text-yellow-800 mb-1">⚠️ Confirmación Final</h4>
                      <p className="text-yellow-700 text-sm">
                        Al finalizar este viaje, el camión quedará disponible para nuevos viajes y 
                        {formData.crear_ingreso_automatico 
                          ? ' se registrará automáticamente el ingreso especificado.' 
                          : ' deberá registrar manualmente el cobro del flete.'}
                      </p>
                    </div>
                  </div>
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
                    disabled={loading}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Finalizando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>🏁 Finalizar Viaje</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Ayuda contextual */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 mt-6">
          <div className="flex items-start space-x-4">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">💡 Consejos para Finalizar el Viaje</h3>
              <ul className="space-y-1 text-blue-100 text-sm">
                <li>• Verifique que el kilometraje final sea correcto para mantener el control de mantenimiento</li>
                <li>• Si registra el cobro automáticamente, se creará un ingreso vinculado a este viaje</li>
                <li>• Las observaciones finales ayudan a llevar un registro detallado del viaje</li>
                <li>• Una vez finalizado, el camión estará disponible para nuevos viajes</li>
                <li>• Puede agregar gastos adicionales del viaje desde la sección "Dinero"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}