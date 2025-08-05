import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useDinero } from '../../hooks/useDinero';
import MovimientoCard from '../../components/dinero/MovimientoCard';
import DineroForm from '../../components/dinero/DineroForm';

export default function Ingresos() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIngreso, setEditingIngreso] = useState(null);

  const {
    ingresos,
    loading,
    error,
    getIngresos,
    createIngreso,
    updateIngreso,
    deleteIngreso,
    clearError
  } = useDinero(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    
    // Cargar ingresos
    getIngresos({ limit: 50 });
  }, [router]);

  const handleCreateIngreso = async (ingresoData) => {
    const result = await createIngreso(ingresoData);
    if (result.success) {
      setShowForm(false);
      getIngresos({ limit: 50 });
    }
    return result;
  };

  const handleUpdateIngreso = async (ingresoData) => {
    const result = await updateIngreso(editingIngreso.id, ingresoData);
    if (result.success) {
      setShowForm(false);
      setEditingIngreso(null);
      getIngresos({ limit: 50 });
    }
    return result;
  };

  const handleDeleteIngreso = async (id) => {
    const result = await deleteIngreso(id);
    if (result.success) {
      getIngresos({ limit: 50 });
    }
    return result;
  };

  const openCreateForm = () => {
    setEditingIngreso(null);
    setShowForm(true);
    clearError();
  };

  const openEditForm = (ingreso) => {
    setEditingIngreso(ingreso);
    setShowForm(true);
    clearError();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingIngreso(null);
    clearError();
  };

  if (!mounted) {
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
        <title>INGRESOS | SISTEMA DE FLETES</title>
        <meta name="description" content="Historial de ingresos" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">HISTORIAL DE INGRESOS</h1>
                <p className="text-green-100">Todos los ingresos registrados</p>
              </div>
            </div>
            
            <button
              onClick={openCreateForm}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>Agregar Ingreso</span>
            </button>
          </div>
        </div>

        {/* Lista de ingresos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Todos los ingresos</h2>
            <button
              onClick={() => getIngresos({ limit: 50 })}
              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
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
                  </div>
                </div>
              ))}
            </div>
          ) : ingresos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay ingresos registrados</h3>
              <p className="text-gray-500 mb-6">Registre su primer ingreso para comenzar</p>
              <button
                onClick={openCreateForm}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Registrar Primer Ingreso
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {ingresos.map(ingreso => (
                <MovimientoCard
                  key={ingreso.id}
                  movimiento={{ ...ingreso, tipo: 'INGRESO' }}
                  onEdit={openEditForm}
                  onDelete={(id) => handleDeleteIngreso(id)}
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
                tipo="INGRESO"
                movimiento={editingIngreso}
                onSave={editingIngreso ? handleUpdateIngreso : handleCreateIngreso}
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