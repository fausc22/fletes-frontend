// pages/rutas/[id].jsx - DETALLE DE RUTA ESPECÍFICA - RESPONSIVE MEJORADO
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRutas } from '../../hooks/useRutas';
import { useViajes } from '../../hooks/useViajes';

export default function DetalleRuta() {
  const router = useRouter();
  const { id } = router.query;
  const { getRutaById, loading: loadingRuta } = useRutas(false);
  const { getViajesByRuta, loading: loadingViajes } = useViajes(false);

  const [mounted, setMounted] = useState(false);
  const [ruta, setRuta] = useState(null);
  const [viajesRuta, setViajesRuta] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(true);

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

    loadRutaDetalle();
  }, [mounted, id]);

  const loadRutaDetalle = async () => {
    try {
      setLoadingDetalle(true);
      
      // Cargar datos de la ruta
      const rutaResult = await getRutaById(id);
      
      if (rutaResult.success) {
        setRuta(rutaResult.data);
        
        // Cargar viajes de esta ruta (últimos 10)
        try {
          const viajesResult = await getViajesByRuta?.(id, { limit: 10 });
          if (viajesResult?.success) {
            setViajesRuta(viajesResult.data.viajes || []);
          }
        } catch (error) {
          console.error('Error cargando viajes:', error);
        }
      } else {
        toast.error('Ruta no encontrada');
        router.push('/rutas');
      }
    } catch (error) {
      console.error('Error cargando detalle de ruta:', error);
      toast.error('Error cargando datos de la ruta');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const formatDistance = (km) => {
    if (!km) return 'N/A';
    return `${parseFloat(km).toLocaleString()} km`;
  };

  const formatTime = (horas) => {
    if (!horas) return 'N/A';
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getVelocidadPromedio = () => {
    if (!ruta?.distancia_km || !ruta?.tiempo_estimado_horas) return null;
    return Math.round(ruta.distancia_km / ruta.tiempo_estimado_horas);
  };

  const getEstadoViaje = (estado) => {
    const colores = {
      'COMPLETADO': 'bg-green-100 text-green-800 border-green-200',
      'EN_CURSO': 'bg-blue-100 text-blue-800 border-blue-200',
      'CANCELADO': 'bg-red-100 text-red-800 border-red-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!mounted) {
    return null;
  }

  if (loadingDetalle) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-4">
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <span className="text-indigo-800 text-sm sm:text-base">Cargando detalle de ruta...</span>
        </div>
      </div>
    );
  }

  if (!ruta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center max-w-md mx-auto">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ruta no encontrada</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">La ruta solicitada no existe</p>
          <Link href="/rutas" className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base">
            Ver Todas las Rutas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 sm:p-6">
      <Head>
        <title>{ruta.nombre} | SISTEMA DE FLETES</title>
        <meta name="description" content={`Detalle de la ruta ${ruta.nombre} - ${ruta.origen} a ${ruta.destino}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* Header - RESPONSIVE */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full flex-shrink-0">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 break-words">{ruta.nombre}</h1>
                <p className="text-indigo-100 text-sm sm:text-lg break-words">
                  {ruta.origen} → {ruta.destino}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:flex-shrink-0">
              <Link 
                href={`/viajes/nuevo?ruta_id=${ruta.id}`}
                className="bg-green-500 hover:bg-green-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>Usar en Viaje</span>
              </Link>
              <Link href="/rutas" className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all text-center text-sm sm:text-base">
                ← Volver
              </Link>
            </div>
          </div>
        </div>

        {/* Información básica de la ruta - RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="xl:col-span-2 space-y-6">
            {/* Detalles técnicos - RESPONSIVE GRID */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-6">Información Técnica</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-indigo-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-sm font-medium text-indigo-800 mb-2">Distancia</h3>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-900">{formatDistance(ruta.distancia_km)}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Tiempo Estimado</h3>
                  <p className="text-xl sm:text-2xl font-bold text-green-900">{formatTime(ruta.tiempo_estimado_horas)}</p>
                </div>
                
                {getVelocidadPromedio() && (
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Velocidad Promedio</h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-900">{getVelocidadPromedio()} km/h</p>
                  </div>
                )}
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Estado</h3>
                  <p className="text-lg font-bold text-gray-900">
                    {ruta.activo ? '✅ Activa' : '❌ Inactiva'}
                  </p>
                </div>
              </div>
            </div>

            {/* Estadísticas de viajes - RESPONSIVE GRID */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-6">Estadísticas de Viajes</h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">{ruta.total_viajes || 0}</div>
                  <div className="text-xs sm:text-sm text-blue-700">Total de viajes</div>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{ruta.viajes_completados || 0}</div>
                  <div className="text-xs sm:text-sm text-green-700">Completados</div>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{ruta.viajes_activos || 0}</div>
                  <div className="text-xs sm:text-sm text-yellow-700">En curso</div>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {Math.round(ruta.promedio_km_real || 0).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-700">Km promedio real</div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral - RESPONSIVE */}
          <div className="space-y-6">
            {/* Información financiera */}
            {ruta.total_viajes > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Información Financiera</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-700">Ingresos promedio</span>
                    <span className="font-bold text-green-800 text-sm sm:text-base">
                      ${(ruta.promedio_ingresos || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">Ingresos totales</span>
                    <span className="font-bold text-blue-800 text-sm sm:text-base">
                      ${(ruta.ingresos_totales || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  {ruta.es_rentable && (
                    <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                        </svg>
                        <span className="text-sm font-medium text-green-800">Ruta Rentable</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acciones rápidas - RESPONSIVE */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Acciones</h3>
              
              <div className="space-y-3">
                <Link 
                  href={`/viajes/nuevo?ruta_id=${ruta.id}`}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <span>Iniciar Viaje</span>
                </Link>
                
                <Link 
                  href={`/viajes/historial?ruta_id=${ruta.id}`}
                  className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Ver Historial</span>
                </Link>
                
                <button
                  onClick={() => router.push(`/rutas?edit=${ruta.id}`)}
                  className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  <span>Editar Ruta</span>
                </button>
              </div>
            </div>

            {/* Información adicional - RESPONSIVE */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Fecha de creación</h4>
              <p className="text-gray-600 text-sm sm:text-base">{formatDate(ruta.fecha_creacion)}</p>
              
              {ruta.promedio_dias && (
                <div className="mt-3">
                  <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Duración promedio</h4>
                  <p className="text-gray-600 text-sm sm:text-base">{ruta.promedio_dias} día{ruta.promedio_dias !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Historial de viajes recientes - RESPONSIVE */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <h2 className="text-xl font-bold text-gray-800">Viajes Recientes</h2>
            {viajesRuta.length > 0 && (
              <Link 
                href={`/viajes/historial?ruta_id=${ruta.id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-1"
              >
                <span>Ver todos</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            )}
          </div>
          
          {loadingViajes ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-indigo-800 text-sm sm:text-base">Cargando viajes...</span>
            </div>
          ) : viajesRuta.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay viajes registrados</h3>
              <p className="text-gray-500 mb-6 text-sm sm:text-base">Esta ruta aún no se ha utilizado en ningún viaje</p>
              <Link 
                href={`/viajes/nuevo?ruta_id=${ruta.id}`}
                className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>Primer Viaje con esta Ruta</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {viajesRuta.map((viaje) => (
                <div key={viaje.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                          <circle cx="7" cy="19" r="2"/>
                          <circle cx="17" cy="19" r="2"/>
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-800 text-sm sm:text-base">{viaje.patente}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {formatDate(viaje.fecha_inicio)} 
                          {viaje.fecha_fin && ` - ${formatDate(viaje.fecha_fin)}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${
                        getEstadoViaje(viaje.estado)
                      }`}>
                        {viaje.estado.replace('_', ' ')}
                      </span>
                      <Link 
                        href={`/viajes/detalle/${viaje.id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <span>Ver</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Km recorridos:</span>
                      <span className="font-medium ml-2">
                        {viaje.km_recorridos ? `${viaje.km_recorridos.toLocaleString()} km` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duración:</span>
                      <span className="font-medium ml-2">
                        {viaje.fecha_fin 
                          ? `${Math.ceil((new Date(viaje.fecha_fin) - new Date(viaje.fecha_inicio)) / (1000 * 60 * 60 * 24))} días`
                          : 'En curso'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium ml-2">#{viaje.id}</span>
                    </div>
                  </div>
                  
                  {viaje.observaciones && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Observaciones:</strong> {viaje.observaciones}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}