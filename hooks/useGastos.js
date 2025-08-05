// hooks/useGastos.js - SISTEMA DE FLETES - HOOK BÁSICO
import { useState, useEffect } from 'react';
import { axiosAuth } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

export const useGastos = (autoLoad = true) => {
  const [state, setState] = useState({
    gastos: [],
    categorias: [],
    estadisticas: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      limit: 20,
      offset: 0
    }
  });

  // ✅ OBTENER TODOS LOS GASTOS
  const getGastos = async (filtros = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros si existen
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.offset) params.append('offset', filtros.offset);
      if (filtros.camion_id) params.append('camion_id', filtros.camion_id);
      if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      
      const queryString = params.toString();
      const url = `/dinero/gastos${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Obteniendo gastos de:', url);
      const response = await axiosAuth.get(url);
      
      setState(prev => ({ 
        ...prev, 
        gastos: response.data.gastos,
        pagination: {
          total: response.data.total,
          limit: response.data.limit,
          offset: response.data.offset
        },
        loading: false 
      }));
      
      console.log('✅ Gastos obtenidos:', response.data.gastos.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo gastos:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo gastos';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER UN GASTO POR ID
  const getGastoById = async (id) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔍 Obteniendo gasto ID:', id);
      const response = await axiosAuth.get(`/dinero/gastos/${id}`);
      
      setState(prev => ({ ...prev, loading: false }));
      
      console.log('✅ Gasto obtenido:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo gasto:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo gasto';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ CREAR NUEVO GASTO
  const createGasto = async (gastoData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📝 Creando gasto:', gastoData);
      const response = await axiosAuth.post('/dinero/gastos', gastoData);
      
      // Actualizar lista local
      setState(prev => ({ 
        ...prev, 
        gastos: [response.data.gasto, ...prev.gastos],
        loading: false 
      }));
      
      toast.success('Gasto registrado exitosamente');
      console.log('✅ Gasto creado:', response.data.gasto);
      
      return { success: true, data: response.data.gasto };
      
    } catch (error) {
      console.error('❌ Error creando gasto:', error);
      const errorMessage = error.response?.data?.message || 'Error registrando gasto';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ ACTUALIZAR GASTO
  const updateGasto = async (id, gastoData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📝 Actualizando gasto ID:', id, gastoData);
      const response = await axiosAuth.put(`/dinero/gastos/${id}`, gastoData);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        gastos: prev.gastos.map(gasto => 
          gasto.id === id ? response.data.gasto : gasto
        ),
        loading: false
      }));
      
      toast.success('Gasto actualizado exitosamente');
      console.log('✅ Gasto actualizado:', response.data.gasto);
      
      return { success: true, data: response.data.gasto };
      
    } catch (error) {
      console.error('❌ Error actualizando gasto:', error);
      const errorMessage = error.response?.data?.message || 'Error actualizando gasto';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ ELIMINAR GASTO
  const deleteGasto = async (id) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🗑️ Eliminando gasto ID:', id);
      const response = await axiosAuth.delete(`/dinero/gastos/${id}`);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        gastos: prev.gastos.filter(gasto => gasto.id !== id),
        loading: false
      }));
      
      toast.success('Gasto eliminado exitosamente');
      console.log('✅ Gasto eliminado:', id);
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error eliminando gasto:', error);
      const errorMessage = error.response?.data?.message || 'Error eliminando gasto';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER CATEGORÍAS DE GASTOS
  const getCategorias = async () => {
    try {
      console.log('📂 Obteniendo categorías de gastos...');
      const response = await axiosAuth.get('/dinero/categorias?tipo=GASTO');
      
      setState(prev => ({ 
        ...prev, 
        categorias: response.data 
      }));
      
      console.log('✅ Categorías obtenidas:', response.data.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo categorías';
      
      // No mostrar toast para categorías, es información secundaria
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER ESTADÍSTICAS
  const getEstadisticas = async () => {
    try {
      console.log('📊 Obteniendo estadísticas de gastos...');
      const response = await axiosAuth.get('/dinero/estadisticas');
      
      setState(prev => ({ 
        ...prev, 
        estadisticas: response.data 
      }));
      
      console.log('✅ Estadísticas de gastos obtenidas:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo estadísticas';
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ FILTRAR GASTOS POR CAMIÓN
  const getGastosByCamion = async (camionId, filtros = {}) => {
    return await getGastos({ ...filtros, camion_id: camionId });
  };

  // ✅ FILTRAR GASTOS POR CATEGORÍA
  const getGastosByCategoria = async (categoriaId, filtros = {}) => {
    return await getGastos({ ...filtros, categoria_id: categoriaId });
  };

  // ✅ CAMBIAR PÁGINA
  const changePage = async (newOffset, filtros = {}) => {
    await getGastos({ ...filtros, offset: newOffset });
  };

  // ✅ RECARGAR DATOS
  const refresh = async () => {
    console.log('🔄 Recargando datos de gastos...');
    await getGastos();
    await getCategorias();
    await getEstadisticas();
  };

  // ✅ LIMPIAR ERRORES
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // ✅ CARGAR AUTOMÁTICAMENTE AL MONTAR
  useEffect(() => {
    if (autoLoad) {
      console.log('🚀 Cargando gastos automáticamente...');
      getCategorias();
      getEstadisticas();
    }
  }, [autoLoad]);

  return {
    // Estado
    ...state,
    
    // Acciones
    getGastos,
    getGastoById,
    createGasto,
    updateGasto,
    deleteGasto,
    getCategorias,
    getEstadisticas,
    getGastosByCamion,
    getGastosByCategoria,
    changePage,
    refresh,
    clearError,
    
    // Utilidades
    totalGastos: state.gastos.length,
    totalGastado: state.gastos.reduce((sum, gasto) => sum + (gasto.total || 0), 0),
    gastosPorCategoria: state.gastos.reduce((acc, gasto) => {
      const categoria = gasto.categoria_nombre || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + gasto.total;
      return acc;
    }, {}),
    hasNextPage: (state.pagination.offset + state.pagination.limit) < state.pagination.total,
    hasPrevPage: state.pagination.offset > 0
  };
};