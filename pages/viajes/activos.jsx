// pages/viajes/activos.jsx - VIAJES ACTIVOS MEJORADO Y RESPONSIVO
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useViajes } from '../../hooks/useViajes';
import ViajeDetailModal from '../../components/modals/ViajeDetailModal';
import GastoModal from '../../components/modals/GastoModal';

export default function ViajesActivos() {
  const router = useRouter();
  const { 
    viajesActivos, 
    getViajesActivos, 
    cancelarViaje,
    loading, 
    refresh 
  } = useViajes(false);
  
  const [mounted, setMounted] = useState(false);
  
  // Estados para modales
  const [selectedViaje, setSelectedViaje] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGastoModal, setShowGastoModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    getViajesActivos();
  }, [mounted]);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularDiasEnViaje = (fechaInicio) => {
    if (!fechaInicio) return 0;
    const inicio = new Date(fechaInicio);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getEstadoColor = (diasEnViaje) => {
    if (diasEnViaje <= 2) return 'bg-green-100 text-green-800 border-green-200';
    if (diasEnViaje <= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const handleVerDetalle = (viaje) => {
    setSelectedViaje(viaje);
    setShowDetailModal(true);
  };

  const handleAgregarGasto = (viaje) => {
    setSelectedViaje(viaje);
    setShowGastoModal(true);
  };

  const handleCancelarViaje = async (viajeId, patente) => {
    const motivo = prompt(`¿Por qué desea cancelar el viaje del camión ${patente}?\n\nIngrese el motivo de cancelación:`);
    
    if (!motivo) return;
    
    try {
      const result = await cancelarViaje(viajeId, motivo);
      if (result.success) {
        toast.success(`Viaje del camión ${patente} cancelado exitosamente`);
        await refresh();
      }
    } catch (error) {
      console.error('Error cancelando viaje:', error);
    }
  };

  const handleGastoCreated = () => {
    toast.success('Gasto registrado y vinculado al viaje');
    setShowGastoModal(false);
    setSelectedViaje(null);
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-blue-800">Cargando viajes activos...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6">
      <Head>
        <title>VIAJES ACTIVOS | SISTEMA DE FLETES</title>
        <meta name="description" content="Gestión de viajes en curso" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header responsive */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">VIAJES ACTIVOS</h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  {viajesActivos.length} viaje{viajesActivos.length !== 1 ? 's' : ''} en curso
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={refresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>Actualizar</span>
              </button>
              <Link href="/viajes" className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all text-center">
                ← Volver
              </Link>
            </div>
          </div>
        </div>

        {/* Acciones rápidas - Responsive */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Acciones Rápidas</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Link 
                href="/viajes/nuevo" 
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>Nuevo Viaje</span>
              </Link>
              <Link 
                href="/viajes/historial" 
                className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Ver Historial</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Lista de viajes activos */}
        {viajesActivos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">No hay viajes activos</h3>
            <p className="text-gray-600 mb-6 sm:mb-8">Todos los camiones están disponibles para iniciar nuevos viajes</p>
            <Link 
              href="/viajes/nuevo" 
              className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-green-700 transition-colors text-base sm:text-lg font-medium inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>Iniciar Primer Viaje</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {viajesActivos.map((viaje) => {
              const diasEnViaje = calcularDiasEnViaje(viaje.fecha_inicio);
              
              return (
                <div key={viaje.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Card Header - Siempre visible */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                            <circle cx="7" cy="19" r="2"/>
                            <circle cx="17" cy="19" r="2"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                            {viaje.patente} - {viaje.marca} {viaje.modelo}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 truncate">
                            {viaje.ruta_nombre 
                              ? `${viaje.ruta_nombre} (${viaje.origen} → ${viaje.destino})`
                              : 'Destino personalizado'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${
                          getEstadoColor(diasEnViaje)
                        }`}>
                          {diasEnViaje} día{diasEnViaje !== 1 ? 's' : ''} en viaje
                        </span>
                        <Link 
                          href={`/viajes/finalizar/${viaje.id}`}
                          className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto text-center"
                        >
                          Finalizar Viaje
                        </Link>
                      </div>
                    </div>

                    {/* Detalles del viaje - Responsive Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-4 sm:mt-6">
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Fecha de Inicio</h4>
                        <p className="text-sm sm:text-lg font-bold text-gray-800">{formatearFecha(viaje.fecha_inicio)}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Km Inicial</h4>
                        <p className="text-sm sm:text-lg font-bold text-gray-800">
                          {viaje.km_inicial?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Km Estimados</h4>
                        <p className="text-sm sm:text-lg font-bold text-gray-800">
                          {viaje.km_estimados_recorridos?.toLocaleString() || 'Calculando...'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Estado</h4>
                        <p className="text-sm sm:text-lg font-bold text-green-600">EN CURSO</p>
                      </div>
                    </div>

                    {/* Observaciones si existen */}
                    {viaje.observaciones && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-4">
                        <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-2">Observaciones:</h4>
                        <p className="text-sm sm:text-base text-blue-700">{viaje.observaciones}</p>
                      </div>
                    )}

                    {/* Acciones por viaje - Mobile First */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pt-4 mt-4 border-t border-gray-200 space-y-3 lg:space-y-0">
                      <div className="flex flex-wrap gap-2 sm:gap-4">
                        <button 
                          onClick={() => handleVerDetalle(viaje)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 text-sm sm:text-base"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          <span>Ver Detalles</span>
                        </button>
                        
                        <button 
                          onClick={() => handleAgregarGasto(viaje)}
                          className="text-red-600 hover:text-red-800 font-medium flex items-center space-x-1 text-sm sm:text-base"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                          </svg>
                          <span>Agregar Gasto</span>
                        </button>

                        <button
                          onClick={() => handleCancelarViaje(viaje.id, viaje.patente)}
                          className="text-gray-600 hover:text-gray-800 font-medium flex items-center space-x-1 text-sm sm:text-base"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                          <span>Cancelar</span>
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        {diasEnViaje > 7 && (
                          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                            ⚠️ Viaje prolongado
                          </div>
                        )}
                        <Link 
                          href={`/viajes/finalizar/${viaje.id}`}
                          className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span>Finalizar</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Estadísticas rápidas - Responsive */}
        {viajesActivos.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Estadísticas Rápidas</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{viajesActivos.length}</div>
                <div className="text-xs sm:text-sm text-blue-700">Viajes Activos</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {viajesActivos.filter(v => calcularDiasEnViaje(v.fecha_inicio) <= 2).length}
                </div>
                <div className="text-xs sm:text-sm text-green-700">Recién Iniciados</div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
                  {viajesActivos.filter(v => {
                    const dias = calcularDiasEnViaje(v.fecha_inicio);
                    return dias > 2 && dias <= 5;
                  }).length}
                </div>
                <div className="text-xs sm:text-sm text-yellow-700">En Ruta</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">
                  {viajesActivos.filter(v => calcularDiasEnViaje(v.fecha_inicio) > 5).length}
                </div>
                <div className="text-xs sm:text-sm text-red-700">Prolongados</div>
              </div>
            </div>
          </div>
        )}

        {/* Consejos y recordatorios - Responsive */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4 sm:p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg flex-shrink-0 self-center sm:self-start">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-2">💡 Recordatorios Importantes</h3>
              <ul className="space-y-1 text-orange-100 text-sm sm:text-base">
                <li>• Registre gastos de combustible, peajes y comida durante el viaje</li>
                <li>• Mantenga registro del kilometraje para el mantenimiento</li>
                <li>• Finalice el viaje cuando llegue al destino para registrar automáticamente el ingreso</li>
                <li>• Los viajes prolongados (más de 7 días) requieren atención especial</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ViajeDetailModal 
        viaje={selectedViaje}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedViaje(null);
        }}
      />

      <GastoModal 
        viaje={selectedViaje}
        isOpen={showGastoModal}
        onClose={() => {
          setShowGastoModal(false);
          setSelectedViaje(null);
        }}
        onGastoCreated={handleGastoCreated}
      />
    </div>
  );
}