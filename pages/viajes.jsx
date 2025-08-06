// pages/viajes.jsx - PÁGINA PRINCIPAL DE VIAJES CON DATOS REALES
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useViajes } from '../hooks/useViajes';

export default function Viajes() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { 
    viajesActivos, 
    viajes, 
    getViajesActivos, 
    getViajes, 
    viajesActivosCount,
    viajesCompletados
  } = useViajes(false);

  useEffect(() => {
    const initData = async () => {
      // Verificar autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        // Cargar viajes activos y últimos viajes completados
        await Promise.all([
          getViajesActivos(),
          getViajes({ estado: 'COMPLETADO', limit: 5 })
        ]);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [router]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-green-800">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6">
      <Head>
        <title>MIS VIAJES | SISTEMA DE FLETES</title>
        <meta name="description" content="Gestión de viajes y rutas" />
      </Head>

      {/* Header de la sección */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">MIS VIAJES</h1>
              <p className="text-green-100">
                {viajesActivosCount} viaje{viajesActivosCount !== 1 ? 's' : ''} activo{viajesActivosCount !== 1 ? 's' : ''} • {viajesCompletados} completado{viajesCompletados !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Opciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Iniciar nuevo viaje */}
          <Link href="/viajes/nuevo" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-green-500 cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-green-100 to-green-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 ml-3">INICIAR VIAJE</h3>
              </div>
              <p className="text-gray-600">Comenzar un nuevo viaje de flete</p>
            </div>
          </Link>

          {/* Ver viajes activos */}
          <Link href="/viajes/activos" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-blue-500 cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 ml-3">VIAJES ACTIVOS</h3>
              </div>
              <p className="text-gray-600">
                Ver {viajesActivosCount} viaje{viajesActivosCount !== 1 ? 's' : ''} en curso
              </p>
            </div>
          </Link>

          {/* Historial de viajes */}
          <Link href="/viajes/historial" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-purple-500 cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 ml-3">HISTORIAL</h3>
              </div>
              <p className="text-gray-600">Ver viajes finalizados</p>
            </div>
          </Link>
        </div>

        {/* Viajes activos - Vista rápida */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Viajes Activos ({viajesActivosCount})
          </h2>
          
          {/* Lista de viajes activos REAL */}
          <div className="space-y-4">
            {viajesActivos.length > 0 ? viajesActivos.map((viaje) => {
              const diasEnViaje = calcularDiasEnViaje(viaje.fecha_inicio);
              const estadoColor = diasEnViaje <= 2 ? 'green' : diasEnViaje <= 5 ? 'yellow' : 'red';
              
              return (
                <div key={viaje.id} className={`border-l-4 border-${estadoColor}-500 bg-${estadoColor}-50 p-4 rounded-r-lg`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-${estadoColor}-100 rounded-lg flex items-center justify-center`}>
                        <svg className={`w-6 h-6 text-${estadoColor}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                          <circle cx="7" cy="19" r="2"/>
                          <circle cx="17" cy="19" r="2"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {viaje.ruta_nombre 
                            ? `${viaje.ruta_nombre} (${viaje.origen} → ${viaje.destino})`
                            : 'Viaje personalizado'
                          }
                        </h3>
                        <p className="text-sm text-gray-600">
                          {viaje.patente} • Iniciado: {formatearFecha(viaje.fecha_inicio)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`bg-${estadoColor}-100 text-${estadoColor}-800 text-xs font-medium px-2 py-1 rounded`}>
                        {diasEnViaje} día{diasEnViaje !== 1 ? 's' : ''} en viaje
                      </span>
                      <Link href={`/viajes/finalizar/${viaje.id}`} className={`bg-${estadoColor}-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-${estadoColor}-700 transition-colors`}>
                        Finalizar
                      </Link>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <p><strong>Destino:</strong> {viaje.ruta_nombre || 'Personalizado'}</p>
                    <p><strong>Km inicial:</strong> {viaje.km_inicial?.toLocaleString()}</p>
                    <p><strong>Días en viaje:</strong> {diasEnViaje}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
                <p className="text-lg mb-2">No hay viajes activos</p>
                <p className="text-sm">Inicie un nuevo viaje para comenzar</p>
              </div>
            )}
          </div>
        </div>

        {/* Últimos viajes finalizados - CON DATOS REALES */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Últimos Viajes Finalizados
          </h2>
          
          <div className="space-y-3">
            {viajes.length > 0 ? viajes.slice(0, 3).map((viaje) => (
              <div key={viaje.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {viaje.ruta_nombre 
                          ? `${viaje.origen} → ${viaje.destino}`
                          : `Viaje ${viaje.patente}`
                        }
                      </h4>
                      <p className="text-sm text-gray-600">
                        {viaje.patente} • {formatearFecha(viaje.fecha_inicio)} - {formatearFecha(viaje.fecha_fin)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {viaje.km_recorridos ? `${viaje.km_recorridos} km` : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {viaje.dias_viaje} día{viaje.dias_viaje !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay viajes completados aún</p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link href="/viajes/historial" className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              <span>Ver historial completo</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/viajes/nuevo" className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span className="font-medium text-green-800">Nuevo Viaje</span>
              </div>
            </Link>

            <Link href="/rutas/nueva" className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
                <span className="font-medium text-blue-800">Nueva Ruta</span>
              </div>
            </Link>

            <Link href="/dinero/ingreso" className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <span className="font-medium text-purple-800">Registrar Cobro</span>
              </div>
            </Link>

            <Link href="/reportes" className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span className="font-medium text-orange-800">Ver Reportes</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}