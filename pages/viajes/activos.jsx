// pages/viajes/activos.jsx - VIAJES ACTIVOS SIMPLIFICADO
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useViajes } from '../../hooks/useViajes';

export default function ViajesActivos() {
  const router = useRouter();
  const { viajesActivos, getViajesActivos, loading, refresh } = useViajes(false);
  const [mounted, setMounted] = useState(false);

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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEstadoColor = (diasEnViaje) => {
    if (diasEnViaje <= 2) return 'bg-green-100 text-green-800 border-green-200';
    if (diasEnViaje <= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">VIAJES ACTIVOS</h1>
                <p className="text-blue-100">
                  {viajesActivos.length} viaje{viajesActivos.length !== 1 ? 's' : ''} en curso
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>Actualizar</span>
              </button>
              <Link href="/viajes" className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                ← Volver
              </Link>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Acciones Rápidas</h2>
            <div className="flex items-center space-x-3">
              <Link 
                href="/viajes/nuevo" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>Nuevo Viaje</span>
              </Link>
              <Link 
                href="/viajes/historial" 
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Ver Historial</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Lista de viajes activos */}
        {viajesActivos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No hay viajes activos</h3>
            <p className="text-gray-600 mb-8">Todos los camiones están disponibles para iniciar nuevos viajes</p>
            <Link 
              href="/viajes/nuevo" 
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium inline-flex items-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>Iniciar Primer Viaje</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {viajesActivos.map((viaje) => {
              const diasEnViaje = calcularDiasEnViaje(viaje.fecha_inicio);
              
              return (
                <div key={viaje.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    {/* Header del viaje */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                            <circle cx="7" cy="19" r="2"/>
                            <circle cx="17" cy="19" r="2"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">
                            {viaje.patente} - {viaje.marca} {viaje.modelo}
                          </h3>
                          <p className="text-gray-600">
                            {viaje.ruta_nombre 
                              ? `${viaje.ruta_nombre} (${viaje.origen} → ${viaje.destino})`
                              : 'Destino personalizado'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                          getEstadoColor(diasEnViaje)
                        }`}>
                          {diasEnViaje} día{diasEnViaje !== 1 ? 's' : ''} en viaje
                        </span>
                        <Link 
                          href={`/viajes/finalizar/${viaje.id}`}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Finalizar Viaje
                        </Link>
                      </div>
                    </div>

                    {/* Detalles del viaje */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Fecha de Inicio</h4>
                        <p className="text-lg font-bold text-gray-800">{formatearFecha(viaje.fecha_inicio)}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Km Inicial</h4>
                        <p className="text-lg font-bold text-gray-800">
                          {viaje.km_inicial?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Km Estimados</h4>
                        <p className="text-lg font-bold text-gray-800">
                          {viaje.km_estimados_recorridos?.toLocaleString() || 'Calculando...'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Estado</h4>
                        <p className="text-lg font-bold text-green-600">EN CURSO</p>
                      </div>
                    </div>

                    {/* Observaciones si existen */}
                    {viaje.observaciones && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Observaciones:</h4>
                        <p className="text-blue-700">{viaje.observaciones}</p>
                      </div>
                    )}

                    {/* Acciones por viaje */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <Link 
                          href={`/viajes/detalle/${viaje.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          <span>Ver Detalles</span>
                        </Link>
                        
                        <Link 
                          href={`/dinero/gasto?viaje_id=${viaje.id}&camion_id=${viaje.camion_id}`}
                          className="text-red-600 hover:text-red-800 font-medium flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                          </svg>
                          <span>Agregar Gasto</span>
                        </Link>

                        <button
                          onClick={() => {
                            if (confirm(`¿Está seguro de cancelar el viaje del camión ${viaje.patente}?`)) {
                              // Implementar cancelación
                              toast.error('Funcionalidad en desarrollo');
                            }
                          }}
                          className="text-gray-600 hover:text-gray-800 font-medium flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                          <span>Cancelar</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-3">
                        {diasEnViaje > 7 && (
                          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                            ⚠️ Viaje prolongado
                          </div>
                        )}
                        <Link 
                          href={`/viajes/finalizar/${viaje.id}`}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
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

        {/* Estadísticas rápidas */}
        {viajesActivos.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Estadísticas Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{viajesActivos.length}</div>
                <div className="text-sm text-blue-700">Viajes Activos</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {viajesActivos.filter(v => calcularDiasEnViaje(v.fecha_inicio) <= 2).length}
                </div>
                <div className="text-sm text-green-700">Recién Iniciados</div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {viajesActivos.filter(v => {
                    const dias = calcularDiasEnViaje(v.fecha_inicio);
                    return dias > 2 && dias <= 5;
                  }).length}
                </div>
                <div className="text-sm text-yellow-700">En Ruta</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {viajesActivos.filter(v => calcularDiasEnViaje(v.fecha_inicio) > 5).length}
                </div>
                <div className="text-sm text-red-700">Prolongados</div>
              </div>
            </div>
          </div>
        )}

        {/* Consejos y recordatorios */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 mt-6">
          <div className="flex items-start space-x-4">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">💡 Recordatorios Importantes</h3>
              <ul className="space-y-1 text-orange-100">
                <li>• Registre gastos de combustible, peajes y comida durante el viaje</li>
                <li>• Mantenga registro del kilometraje para el mantenimiento</li>
                <li>• Finalice el viaje cuando llegue al destino para registrar automáticamente el ingreso</li>
                <li>• Los viajes prolongados (más de 7 días) requieren atención especial</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}