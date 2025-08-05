import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useDinero } from '../../hooks/useDinero';
import MovimientoCard from '../../components/dinero/MovimientoCard';
import DineroForm from '../../components/dinero/DineroForm';

export default function Movimientos() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('GASTO');
  const [editingMovimiento, setEditingMovimiento] = useState(null);
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    camion_id: ''
  });

  const {
    movimientos,
    loading,
    error,
    createGasto,
    createIngreso,
    updateGasto,
    updateIngreso,
    deleteGasto,
    deleteIngreso,
    getMovimientos,
    clearError
  } = useDinero(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    
    // Cargar movimientos
    loadMovimientos();
  }, [router]);

  const loadMovimientos = async () => {
    const filtrosToSend = {};
    if (filtros.desde) filtrosToSend.desde = filtros.desde;
    if (filtros.hasta) filtrosToSend.hasta = filtros.hasta;
    if (filtros.camion_id) filtrosToSend.camion_id = filtros.camion_id;
    
    await getMovimientos({ limit: 100, ...filtrosToSend });
  };

  const handleCreateMovimiento = async (movimientoData) => {
    const result = formType === 'GASTO' 
      ? await createGasto(movimientoData)
      : await createIngreso(movimientoData);
      
    if (result.success) {
      setShowForm(false);
      setEditingMovimiento(null);
      loadMovimientos();
    }
    return result;
  };

  const handleUpdateMovimiento = async (movimientoData) => {
    const result = editingMovimiento.tipo === 'GASTO'
      ? await updateGasto(editingMovimiento.id, movimientoData)
      : await updateIngreso(editingMovimiento.id, movimientoData);
      
    if (result.success) {
      setShowForm(false);
      setEditingMovimiento(null);
      loadMovimientos();
    }
    return result;
  };

  const handleDeleteMovimiento = async (id, tipo) => {
    const result = tipo === 'GASTO' 
      ? await deleteGasto(id)
      : await deleteIngreso(id);
      
    if (result.success) {
      loadMovimientos();
    }
    return result;
  };

  const openGastoForm = () => {
    setFormType('GASTO');
    setEditingMovimiento(null);
    setShowForm(true);
    clearError();
  };

  const openIngresoForm = () => {
    setFormType('INGRESO');
    setEditingMovimiento(null);
    setShowForm(true);
    clearError();
  };

  const openEditForm = (movimiento) => {
    setFormType(movimiento.tipo);
    setEditingMovimiento(movimiento);
    setShowForm(true);
    clearError();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMovimiento(null);
    setFormType('GASTO');
    clearError();
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const aplicarFiltros = () => {
    loadMovimientos();
  };

  const limpiarFiltros = () => {
    setFiltros({
      desde: '',
      hasta: '',
      camion_id: ''
    });
    setTimeout(() => {
      getMovimientos({ limit: 100 });
    }, 100);
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-purple-800">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6">
      <Head>
        <title>MOVIMIENTOS | SISTEMA DE FLETES</title>
        <meta name="description" content="Historial completo de movimientos" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-6h12m0 0l-4-4m4 4l-4 4"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">TODOS LOS MOVIMIENTOS</h1>
                <p className="text-purple-100">Historial completo de ingresos y gastos</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={openIngresoForm}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>Ingreso</span>
              </button>
              
              <button
                onClick={openGastoForm}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                </svg>
                <span>Gasto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
              <input
                type="date"
                name="desde"
                value={filtros.desde}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
              <input
                type="date"
                name="hasta"
                value={filtros.hasta}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-2 flex items-end space-x-3">
              <button
                onClick={aplicarFiltros}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={limpiarFiltros}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de movimientos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {movimientos.length} movimientos encontrados
            </h2>
            <button
              onClick={loadMovimientos}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-1"
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>Actualizar</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-6h12m0 0l-4-4m4 4l-4 4"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay movimientos</h3>
              <p className="text-gray-500 mb-6">No se encontraron movimientos con los filtros aplicados</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={openIngresoForm}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Registrar Ingreso
                </button>
                <button
                  onClick={openGastoForm}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Registrar Gasto
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {movimientos.map(movimiento => (
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
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
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