// pages/rutas/index.jsx - PÁGINA PRINCIPAL DE RUTAS
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRutas } from '../../hooks/useRutas';
import RutaList from '../../components/rutas/RutaList';
import RutaForm from '../../components/rutas/RutaForm';

export default function Rutas() {
  const router = useRouter();
  const { 
    rutas, 
    rutasRentables,
    estadisticas,
    getRutas, 
    createRuta, 
    updateRuta, 
    deleteRuta,
    getRutasRentables,
    getEstadisticas,
    loading, 
    error,
    refresh,
    clearError
  } = useRutas(false);

  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rutaEditando, setRutaEditando] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);

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

    // Cargar datos iniciales
    cargarDatos();
  }, [mounted]);

  const cargarDatos = async () => {
    try {
      await Promise.all([
        getRutas(),
        getRutasRentables(5),
        getEstadisticas()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleNuevaRuta = () => {
    setRutaEditando(null);
    setShowForm(true);
  };

  const handleEditarRuta = (ruta) => {
    setRutaEditando(ruta);
    setShowForm(true);
  };

  const handleGuardarRuta = async (datosRuta) => {
    setLoadingForm(true);
    
    try {
      let result;
      
      if (rutaEditando) {
        result = await updateRuta(rutaEditando.id, datosRuta);
      } else {
        result = await createRuta(datosRuta);
      }

      if (result.success) {
        setShowForm(false);
        setRutaEditando(null);
        
        // Recargar estadísticas y rutas rentables
        await Promise.all([
          getRutasRentables(5),
          getEstadisticas()
        ]);
      }
    } catch (error) {
      console.error('Error guardando ruta:', error);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleEliminarRuta = async (rutaId) => {
    try {
      const result = await deleteRuta(rutaId);
      if (result.success) {
        // Recargar estadísticas después de eliminar
        await getEstadisticas();
      }
    } catch (error) {
      console.error('Error eliminando ruta:', error);
    }
  };

  const handleCancelarForm = () => {
    setShowForm(false);
    setRutaEditando(null);
  };

  if (!mounted) {
    return null;
  }

  if (loading && rutas.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-indigo-800">Cargando rutas...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 sm:p-6">
      <Head>
        <title>RUTAS | SISTEMA DE FLETES</title>
        <meta name="description" content="Gestión de rutas de transporte" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">GESTIÓN DE RUTAS</h1>
                <p className="text-indigo-100">
                  {rutas.length} ruta{rutas.length !== 1 ? 's' : ''} registrada{rutas.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                disabled={loading}
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>Actualizar</span>
              </button>
              <button
                onClick={handleNuevaRuta}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-2 rounded-lg transition-all flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>Nueva Ruta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">{estadisticas.total_rutas}</h3>
                  <p className="text-sm text-gray-600">Total de rutas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">{estadisticas.rutas_activas}</h3>
                  <p className="text-sm text-gray-600">Rutas activas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">{estadisticas.rutas_con_viajes}</h3>
                  <p className="text-sm text-gray-600">Con viajes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {Math.round(estadisticas.distancia_promedio || 0)} km
                  </h3>
                  <p className="text-sm text-gray-600">Distancia promedio</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rutas más rentables */}
        {rutasRentables && rutasRentables.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Rutas Más Rentables</h2>
              <Link 
                href="/reportes/rutas" 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Ver reporte completo →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rutasRentables.slice(0, 3).map((ruta, index) => (
                <div key={ruta.id} className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-green-600">#{index + 1}</span>
                    <span className="text-xs text-green-700">{ruta.viajes_completados} viajes</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{ruta.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-2">{ruta.origen} → {ruta.destino}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">
                      ${Math.round(ruta.ganancia_promedio || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-green-600">
                      {Math.round(ruta.margen_promedio || 0)}% margen
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <RutaForm
                  ruta={rutaEditando}
                  onSave={handleGuardarRuta}
                  onCancel={handleCancelarForm}
                  loading={loadingForm}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lista de rutas */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Todas las Rutas</h2>
              <div className="flex items-center space-x-3">
                <Link 
                  href="/viajes/nuevo" 
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <span>Usar en viaje</span>
                </Link>
                <button
                  onClick={handleNuevaRuta}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <span>Nueva Ruta</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <RutaList
              rutas={rutas}
              loading={loading}
              error={error}
              onEdit={handleEditarRuta}
              onDelete={handleEliminarRuta}
              onRefresh={refresh}
              showFilters={true}
              showActions={true}
            />
          </div>
        </div>

        {/* Consejos y ayuda */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl p-6 mt-8">
          <div className="flex items-start space-x-4">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">💡 Consejos para Gestionar Rutas</h3>
              <ul className="space-y-1 text-indigo-100">
                <li>• Las rutas organizan mejor sus viajes y facilitan la planificación</li>
                <li>• Agregue distancia y tiempo para calcular automáticamente costos</li>
                <li>• Las rutas populares (5+ viajes) suelen ser más rentables</li>
                <li>• Use nombres descriptivos que identifiquen fácilmente la ruta</li>
                <li>• Mantenga activas solo las rutas que usa frecuentemente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Link href="/viajes/nuevo" className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              <span className="font-medium text-gray-800">Iniciar Viaje</span>
            </div>
          </Link>

          <Link href="/viajes/activos" className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span className="font-medium text-gray-800">Viajes Activos</span>
            </div>
          </Link>

          <Link href="/reportes/rutas" className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <span className="font-medium text-gray-800">Ver Reportes</span>
            </div>
          </Link>

          <Link href="/camiones" className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                  <circle cx="7" cy="19" r="2"/>
                  <circle cx="17" cy="19" r="2"/>
                </svg>
              </div>
              <span className="font-medium text-gray-800">Ver Camiones</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}