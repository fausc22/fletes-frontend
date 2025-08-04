// pages/camiones.jsx - PÁGINA PRINCIPAL DE CAMIONES CON COMPONENTES REALES
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useCamiones } from '../hooks/useCamiones';
import { useMantenimientos } from '../hooks/useMantenimientos';
import CamionList from '../components/camiones/CamionList';
import CamionForm from '../components/camiones/CamionForm';

export default function Camiones() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCamion, setEditingCamion] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Hooks
  const {
    camiones,
    loading,
    error,
    estadisticas,
    createCamion,
    updateCamion,
    deleteCamion,
    refresh,
    clearError,
    totalCamiones,
    camionesActivos,
    camionesEnViaje,
    camionesDisponibles
  } = useCamiones();

  const {
    alertas,
    getAlertas,
    alertasUrgentes,
    alertasProximas
  } = useMantenimientos(null, false);

  // Verificar autenticación y cargar datos
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    
    // Cargar alertas de mantenimiento
    getAlertas();
  }, [router]);

  // Manejar creación de camión
  const handleCreateCamion = async (camionData) => {
    const result = await createCamion(camionData);
    if (result.success) {
      setShowForm(false);
      // Recargar alertas después de crear camión
      getAlertas();
    }
    return result;
  };

  // Manejar edición de camión
  const handleUpdateCamion = async (camionData) => {
    const result = await updateCamion(editingCamion.id, camionData);
    if (result.success) {
      setShowForm(false);
      setEditingCamion(null);
    }
    return result;
  };

  // Manejar eliminación de camión
  const handleDeleteCamion = async (camionId) => {
    const result = await deleteCamion(camionId);
    if (result.success) {
      // Recargar alertas después de eliminar camión
      getAlertas();
    }
    return result;
  };

  // Abrir formulario para crear
  const openCreateForm = () => {
    setEditingCamion(null);
    setShowForm(true);
    clearError();
  };

  // Abrir formulario para editar
  const openEditForm = (camion) => {
    setEditingCamion(camion);
    setShowForm(true);
    clearError();
  };

  // Cerrar formulario
  const closeForm = () => {
    setShowForm(false);
    setEditingCamion(null);
    clearError();
  };

  // No renderizar hasta que esté montado
  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-blue-800">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6">
      <Head>
        <title>MIS CAMIONES | SISTEMA DE FLETES</title>
        <meta name="description" content="Gestión de camiones y flota" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header de la sección */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                  <circle cx="7" cy="19" r="2"/>
                  <circle cx="17" cy="19" r="2"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">MIS CAMIONES</h1>
                <p className="text-blue-100">Gestione su flota de camiones</p>
              </div>
            </div>
            
            <button
              onClick={openCreateForm}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>Agregar Camión</span>
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total camiones */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Camiones</p>
                <p className="text-3xl font-bold text-blue-600">{totalCamiones}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Camiones disponibles */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Disponibles</p>
                <p className="text-3xl font-bold text-green-600">{camionesDisponibles}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* En viaje */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En Viaje</p>
                <p className="text-3xl font-bold text-yellow-600">{camionesEnViaje}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Alertas de mantenimiento */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Alertas Mantenim.</p>
                <p className="text-3xl font-bold text-red-600">{alertasUrgentes + alertasProximas}</p>
                <p className="text-xs text-red-500">{alertasUrgentes} urgentes</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de mantenimiento */}
        {alertas.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  Alertas de Mantenimiento
                </h2>
                <Link href="/camiones/mantenimientos" className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                  Ver todos →
                </Link>
              </div>
              
              <div className="space-y-3">
                {alertas.slice(0, 3).map((alerta) => (
                  <div key={alerta.camion_id} className={`p-4 rounded-lg border-l-4 ${
                    alerta.prioridad === 'URGENTE' 
                      ? 'bg-red-50 border-red-500' 
                      : alerta.prioridad === 'VENCIDO'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {alerta.patente} - {alerta.marca} {alerta.modelo}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {alerta.prioridad === 'URGENTE' && alerta.km_restantes <= 1000 && (
                            `Mantenimiento en ${alerta.km_restantes} km`
                          )}
                          {alerta.prioridad === 'VENCIDO' && (
                            `Service vencido desde hace ${Math.abs(alerta.km_restantes)} días`
                          )}
                          {alerta.prioridad === 'PRÓXIMO' && alerta.km_restantes > 1000 && (
                            `Próximo service en ${alerta.km_restantes} km`
                          )}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        alerta.prioridad === 'URGENTE'
                          ? 'bg-red-100 text-red-800'
                          : alerta.prioridad === 'VENCIDO'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alerta.prioridad}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Opciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Agregar camión */}
          <button 
            onClick={openCreateForm}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-green-500 text-left group"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-green-100 to-green-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 ml-3">AGREGAR CAMIÓN</h3>
            </div>
            <p className="text-gray-600">Registrar un nuevo camión en la flota</p>
          </button>

          {/* Ver mantenimientos */}
          <Link href="/camiones/mantenimientos" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-orange-500 cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 ml-3">MANTENIMIENTOS</h3>
              </div>
              <p className="text-gray-600">Ver y registrar mantenimientos</p>
            </div>
          </Link>

          {/* Ver reportes */}
          <Link href="/reportes/por-camion" className="block">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-purple-500 cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 ml-3">VER REPORTES</h3>
              </div>
              <p className="text-gray-600">Estadísticas por camión</p>
            </div>
          </Link>
        </div>

        {/* Lista de camiones */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Todos los camiones</h2>
            <button
              onClick={refresh}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>Actualizar</span>
            </button>
          </div>

          <CamionList
            camiones={camiones}
            loading={loading}
            error={error}
            onEdit={openEditForm}
            onDelete={handleDeleteCamion}
            onRefresh={refresh}
            showFilters={true}
            showActions={true}
          />
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={openCreateForm}
              className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span className="font-medium text-green-800">Agregar Camión</span>
              </div>
            </button>

            <Link href="/dinero/gasto" className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span className="font-medium text-red-800">Registrar Gasto</span>
              </div>
            </Link>

            <Link href="/viajes/nuevo" className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
                </svg>
                <span className="font-medium text-blue-800">Nuevo Viaje</span>
              </div>
            </Link>

            <Link href="/reportes" className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span className="font-medium text-purple-800">Ver Reportes</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <CamionForm
                camion={editingCamion}
                onSave={editingCamion ? handleUpdateCamion : handleCreateCamion}
                onCancel={closeForm}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}