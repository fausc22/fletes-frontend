// pages/camiones/mantenimientos.jsx - PÁGINA DE MANTENIMIENTOS GLOBAL
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useCamiones } from '../../hooks/useCamiones';
import { useMantenimientos } from '../../hooks/useMantenimientos';
import { useGastos } from '../../hooks/useGastos';
import MantenimientoList from '../../components/camiones/MantenimientoList';
import MantenimientoForm from '../../components/camiones/MantenimientoForm';
import { toast } from 'react-hot-toast';

export default function MantenimientosPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMantenimiento, setEditingMantenimiento] = useState(null);
  const [selectedCamion, setSelectedCamion] = useState(null);

  // Hooks
  const { camiones, getCamiones } = useCamiones(false);
  const {
    mantenimientos,
    alertas,
    estadisticas,
    loading,
    error,
    createMantenimiento,
    updateMantenimiento,
    deleteMantenimiento,
    getAllMantenimientos,
    getAlertas,
    getEstadisticas,
    refresh
  } = useMantenimientos(null, false);

  const { createGasto } = useGastos(false);

  // Verificar autenticación y cargar datos
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    
    // Cargar datos iniciales
    loadData();
  }, [router]);

  const loadData = async () => {
    await getCamiones();
    await getAllMantenimientos();
    await getAlertas();
    await getEstadisticas();
  };

  // Manejar creación de mantenimiento
  const handleCreateMantenimiento = async (mantenimientoData) => {
    if (!selectedCamion) {
      toast.error('Debe seleccionar un camión');
      return { success: false, error: 'Camión requerido' };
    }

    const result = await createMantenimiento(selectedCamion.id, mantenimientoData);
    if (result.success) {
      setShowForm(false);
      setSelectedCamion(null);
      
      // Mostrar mensaje de éxito con información del gasto
      if (result.data.gasto_creado) {
        toast.success(`Mantenimiento registrado y gasto creado por $${result.data.gasto_creado.total.toLocaleString()}`);
      } else {
        toast.success('Mantenimiento registrado exitosamente');
      }
      
      // Recargar alertas
      getAlertas();
    }
    return result;
  };

  // Manejar edición de mantenimiento
  const handleUpdateMantenimiento = async (mantenimientoData) => {
    const result = await updateMantenimiento(editingMantenimiento.id, mantenimientoData);
    if (result.success) {
      setShowForm(false);
      setEditingMantenimiento(null);
    }
    return result;
  };

  // Manejar eliminación de mantenimiento
  const handleDeleteMantenimiento = async (mantenimiento) => {
    if (confirm(`¿Está seguro que desea eliminar el mantenimiento "${mantenimiento.tipo}" del ${new Date(mantenimiento.fecha).toLocaleDateString()}?`)) {
      const result = await deleteMantenimiento(mantenimiento.id);
      if (result.success) {
        getAlertas(); // Recargar alertas
      }
    }
  };

  // Manejar creación de gasto desde mantenimiento
  const handleCreateGastoFromMantenimiento = async (mantenimiento) => {
    try {
      // Buscar el camión para obtener información completa
      const camion = camiones.find(c => c.id === mantenimiento.camion_id);
      
      const gastoData = {
        fecha: mantenimiento.fecha,
        nombre: `Mantenimiento - ${mantenimiento.tipo}`,
        descripcion: mantenimiento.descripcion || `Mantenimiento tipo ${mantenimiento.tipo}`,
        total: mantenimiento.costo,
        observaciones: mantenimiento.kilometraje ? `Kilometraje: ${mantenimiento.kilometraje} km` : null,
        camion_id: mantenimiento.camion_id,
        kilometraje_actual: mantenimiento.kilometraje
      };

      const result = await createGasto(gastoData);
      if (result.success) {
        toast.success(`Gasto creado por $${mantenimiento.costo.toLocaleString()}`);
        // Recargar mantenimientos para actualizar el estado
        refresh();
      }
    } catch (error) {
      console.error('Error creando gasto:', error);
      toast.error('Error creando el gasto');
    }
  };

  // Abrir formulario para crear
  const openCreateForm = (camion = null) => {
    setEditingMantenimiento(null);
    setSelectedCamion(camion);
    setShowForm(true);
  };

  // Abrir formulario para editar
  const openEditForm = (mantenimiento) => {
    setEditingMantenimiento(mantenimiento);
    setSelectedCamion(null);
    setShowForm(true);
  };

  // Cerrar formulario
  const closeForm = () => {
    setShowForm(false);
    setEditingMantenimiento(null);
    setSelectedCamion(null);
  };

  // No renderizar hasta que esté montado
  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-orange-800">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6">
      <Head>
        <title>MANTENIMIENTOS | SISTEMA DE FLETES</title>
        <meta name="description" content="Gestión de mantenimientos de camiones" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header de la sección */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">MANTENIMIENTOS</h1>
                <p className="text-orange-100">Gestión integral de mantenimientos</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link 
                href="/camiones"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span>Volver a camiones</span>
              </Link>
              
              <button
                onClick={() => openCreateForm()}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>Nuevo Mantenimiento</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total mantenimientos */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Mantenimientos</p>
                  <p className="text-3xl font-bold text-orange-600">{estadisticas.total_mantenimientos || 0}</p>
                  <p className="text-xs text-orange-500">Este año: {estadisticas.mantenimientos_este_año || 0}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-6h12m0 0l-4-4m4 4l-4 4"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Costo total */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Costo Total Año</p>
                  <p className="text-3xl font-bold text-red-600">${estadisticas.costo_total_año?.toLocaleString() || 0}</p>
                  <p className="text-xs text-red-500">Promedio: ${estadisticas.costo_promedio?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Este mes */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Este Mes</p>
                  <p className="text-3xl font-bold text-blue-600">{estadisticas.mantenimientos_este_mes || 0}</p>
                  <p className="text-xs text-blue-500">Mantenimientos realizados</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Alertas */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Alertas Activas</p>
                  <p className="text-3xl font-bold text-yellow-600">{alertas?.length || 0}</p>
                  <p className="text-xs text-yellow-500">Mantenimientos pendientes</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas de mantenimientos próximos */}
        {alertas && alertas.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  Alertas de Mantenimiento
                </h2>
                <span className="text-sm text-gray-500">
                  {alertas.length} {alertas.length === 1 ? 'alerta activa' : 'alertas activas'}
                </span>
              </div>
              
              <div className="space-y-3">
                {alertas.slice(0, 5).map((alerta) => (
                  <div key={alerta.camion_id} className={`p-4 rounded-lg border-l-4 ${
                    alerta.prioridad === 'URGENTE' 
                      ? 'bg-red-50 border-red-500' 
                      : alerta.prioridad === 'VENCIDO'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {alerta.patente} - {alerta.marca} {alerta.modelo}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {alerta.prioridad === 'URGENTE' && alerta.km_restantes <= 1000 && (
                            `⚠️ Mantenimiento URGENTE en ${alerta.km_restantes} km`
                          )}
                          {alerta.prioridad === 'VENCIDO' && (
                            `🔴 Service vencido desde hace ${Math.abs(alerta.km_restantes)} días`
                          )}
                          {alerta.prioridad === 'PRÓXIMO' && alerta.km_restantes > 1000 && (
                            `🟡 Próximo service en ${alerta.km_restantes} km`
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          alerta.prioridad === 'URGENTE'
                            ? 'bg-red-100 text-red-800'
                            : alerta.prioridad === 'VENCIDO'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alerta.prioridad}
                        </span>
                        <button
                          onClick={() => {
                            const camion = camiones.find(c => c.id === alerta.camion_id);
                            if (camion) openCreateForm(camion);
                          }}
                          className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition-colors"
                        >
                          Registrar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {alertas.length > 5 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Y {alertas.length - 5} alertas más...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selector de camión para nuevo mantenimiento */}
        {showForm && !editingMantenimiento && !selectedCamion && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Seleccionar Camión</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {camiones.filter(c => c.activo).map(camion => (
                  <button
                    key={camion.id}
                    onClick={() => setSelectedCamion(camion)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                          <circle cx="7" cy="19" r="2"/>
                          <circle cx="17" cy="19" r="2"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{camion.patente}</h4>
                        <p className="text-sm text-gray-600">{camion.marca} {camion.modelo}</p>
                        <p className="text-xs text-gray-500">{camion.kilometros?.toLocaleString()} km</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={closeForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de mantenimientos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Historial de Mantenimientos</h2>
            <button
              onClick={refresh}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center space-x-1"
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>Actualizar</span>
            </button>
          </div>

          <MantenimientoList
            camionId={null}
            showFilters={true}
            showActions={true}
            onEdit={openEditForm}
            onDelete={handleDeleteMantenimiento}
            onCreateGasto={handleCreateGastoFromMantenimiento}
            limit={20}
          />
        </div>

        {/* Accesos rápidos */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => openCreateForm()}
              className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span className="font-medium text-orange-800">Nuevo Mantenimiento</span>
              </div>
            </button>

            <Link href="/camiones" className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                  <circle cx="7" cy="19" r="2"/>
                  <circle cx="17" cy="19" r="2"/>
                </svg>
                <span className="font-medium text-blue-800">Ver Camiones</span>
              </div>
            </Link>

            <Link href="/dinero/historial-gastos" className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <span className="font-medium text-green-800">Ver Gastos</span>
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
      {showForm && (editingMantenimiento || selectedCamion) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <MantenimientoForm
                mantenimiento={editingMantenimiento}
                camion={selectedCamion || (editingMantenimiento && camiones.find(c => c.id === editingMantenimiento.camion_id))}
                onSave={editingMantenimiento ? handleUpdateMantenimiento : handleCreateMantenimiento}
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

MantenimientosPage.getLayout = (page) => page;