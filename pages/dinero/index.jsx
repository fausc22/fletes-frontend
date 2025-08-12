// pages/dinero/index.jsx - PÁGINA PRINCIPAL DEL MÓDULO DINERO - RESPONSIVE MEJORADA
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useDinero } from '../../hooks/useDinero';
import MovimientoCard from '../../components/dinero/MovimientoCard';
import DineroForm from '../../components/dinero/DineroForm';

export default function Dinero() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('GASTO'); // 'GASTO' o 'INGRESO'
  const [editingMovimiento, setEditingMovimiento] = useState(null);

  // Hook de dinero
  const {
    movimientos,
    estadisticas,
    resumenMensual,
    loading,
    error,
    createGasto,
    createIngreso,
    updateGasto,
    updateIngreso,
    deleteGasto,
    deleteIngreso,
    getMovimientos,
    getEstadisticas,
    getResumenMensual,
    clearError,
    refresh
  } = useDinero();

  // Verificar autenticación y cargar datos
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    
    // Cargar datos iniciales
    loadInitialData();
  }, [router]);

  const loadInitialData = async () => {
    await Promise.all([
      getMovimientos({ limit: 10 }),
      getEstadisticas(),
      getResumenMensual()
    ]);
  };

  // Manejar creación de movimiento
  const handleCreateMovimiento = async (movimientoData) => {
    const result = formType === 'GASTO' 
      ? await createGasto(movimientoData)
      : await createIngreso(movimientoData);
      
    if (result.success) {
      setShowForm(false);
      setEditingMovimiento(null);
      // Recargar datos
      loadInitialData();
    }
    return result;
  };

  // Manejar edición de movimiento
  const handleUpdateMovimiento = async (movimientoData) => {
    const result = editingMovimiento.tipo === 'GASTO'
      ? await updateGasto(editingMovimiento.id, movimientoData)
      : await updateIngreso(editingMovimiento.id, movimientoData);
      
    if (result.success) {
      setShowForm(false);
      setEditingMovimiento(null);
      // Recargar datos
      loadInitialData();
    }
    return result;
  };

  // Manejar eliminación de movimiento
  const handleDeleteMovimiento = async (id, tipo) => {
    const result = tipo === 'GASTO' 
      ? await deleteGasto(id)
      : await deleteIngreso(id);
      
    if (result.success) {
      // Recargar datos
      loadInitialData();
    }
    return result;
  };

  // Abrir formulario para crear gasto
  const openGastoForm = () => {
    setFormType('GASTO');
    setEditingMovimiento(null);
    setShowForm(true);
    clearError();
  };

  // Abrir formulario para crear ingreso
  const openIngresoForm = () => {
    setFormType('INGRESO');
    setEditingMovimiento(null);
    setShowForm(true);
    clearError();
  };

  // Abrir formulario para editar
  const openEditForm = (movimiento) => {
    setFormType(movimiento.tipo);
    setEditingMovimiento(movimiento);
    setShowForm(true);
    clearError();
  };

  // Cerrar formulario
  const closeForm = () => {
    setShowForm(false);
    setEditingMovimiento(null);
    setFormType('GASTO');
    clearError();
  };

  // Función para formatear dinero
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // No renderizar hasta que esté montado
  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-purple-800">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 lg:p-6">
      <Head>
        <title>DINERO | SISTEMA DE FLETES</title>
        <meta name="description" content="Gestión de ingresos y gastos" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header de la sección - RESPONSIVE */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">DINERO</h1>
              <p className="text-purple-100 text-sm sm:text-base">Control de ingresos y gastos</p>
            </div>
          </div>
        </div>

        {/* Resumen rápido - GRID RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total ingresos del mes */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Ingresos del Mes</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 truncate">
                  {formatMoney(resumenMensual?.total_ingresos || 0)}
                </p>
                <p className="text-xs text-green-500">
                  {resumenMensual?.cantidad_ingresos || 0} movimientos
                </p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Total gastos del mes */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Gastos del Mes</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 truncate">
                  {formatMoney(resumenMensual?.total_gastos || 0)}
                </p>
                <p className="text-xs text-red-500">
                  {resumenMensual?.cantidad_gastos || 0} movimientos
                </p>
              </div>
              <div className="bg-red-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Balance del mes */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Balance del Mes</p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${
                  (resumenMensual?.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {formatMoney(resumenMensual?.balance || 0)}
                </p>
                <p className="text-xs text-blue-500">
                  {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Opciones principales - BOTONES GRANDES RESPONSIVOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Registrar gasto */}
          <button 
            onClick={openGastoForm}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-red-500 text-left group w-full"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-red-100 to-red-200 p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 ml-3 sm:ml-4">REGISTRAR GASTO</h3>
            </div>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Registrar combustible, mantenimiento y otros gastos</p>
          </button>

          {/* Registrar ingreso */}
          <button 
            onClick={openIngresoForm}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-green-500 text-left group w-full"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-green-100 to-green-200 p-3 sm:p-4 rounded-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 ml-3 sm:ml-4">REGISTRAR INGRESO</h3>
            </div>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Registrar cobros de viajes o otros ingresos</p>
          </button>
        </div>

        {/* Ver historial - BOTONES MEDIANOS RESPONSIVOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link href="/dinero/gastos" className="block">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-red-200 cursor-pointer group">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-red-50 p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-6h12m0 0l-4-4m4 4l-4 4"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 ml-3">HISTORIAL DE GASTOS</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">Ver todos los gastos registrados</p>
            </div>
          </Link>

          <Link href="/dinero/ingresos" className="block">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-green-200 cursor-pointer group">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-green-50 p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-6h12m0 0l-4-4m4 4l-4 4"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 ml-3">HISTORIAL DE INGRESOS</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">Ver todos los ingresos registrados</p>
            </div>
          </Link>
        </div>

        {/* Últimos movimientos - SECCIÓN RESPONSIVE */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Últimos Movimientos
            </h2>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => loadInitialData()}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center justify-center sm:justify-start space-x-1 py-2 px-3 rounded-lg hover:bg-purple-50 transition-colors"
                disabled={loading}
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>Actualizar</span>
              </button>
              
              <Link href="/dinero/movimientos" className="text-purple-600 hover:text-purple-800 text-sm font-medium text-center sm:text-left py-2 px-3 rounded-lg hover:bg-purple-50 transition-colors">
                Ver todos →
              </Link>
            </div>
          </div>
          
          {/* Lista de movimientos - RESPONSIVE */}
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 sm:p-6 animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-16 sm:w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No hay movimientos registrados</h3>
              <p className="text-gray-500 mb-6 text-sm sm:text-base">Registre su primer ingreso o gasto para comenzar</p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={openIngresoForm}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Registrar Ingreso
                </button>
                <button
                  onClick={openGastoForm}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Registrar Gasto
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {movimientos.slice(0, 5).map(movimiento => (
                <MovimientoCard
                  key={`${movimiento.tipo}-${movimiento.id}`}
                  movimiento={movimiento}
                  onEdit={openEditForm}
                  onDelete={handleDeleteMovimiento}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Acciones rápidas - GRID RESPONSIVE */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={openIngresoForm}
              className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span className="font-medium text-green-800 text-sm sm:text-base">Nuevo Ingreso</span>
              </div>
            </button>

            <button
              onClick={openGastoForm}
              className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                </svg>
                <span className="font-medium text-red-800 text-sm sm:text-base">Nuevo Gasto</span>
              </div>
            </button>

            <Link href="/dinero/movimientos" className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 hover:bg-purple-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-6h12m0 0l-4-4m4 4l-4 4"/>
                </svg>
                <span className="font-medium text-purple-800 text-sm sm:text-base">Ver Historial</span>
              </div>
            </Link>

            <Link href="/reportes" className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span className="font-medium text-blue-800 text-sm sm:text-base">Ver Reportes</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal del formulario - RESPONSIVO */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <DineroForm
                tipo={formType}
                movimiento={editingMovimiento}
                onSave={editingMovimiento ? handleUpdateMovimiento : handleCreateMovimiento}
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