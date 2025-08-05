// hooks/useDinero.js - SISTEMA DE FLETES
import { useState, useEffect } from 'react';
import { axiosAuth } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

export const useDinero = (autoLoad = true) => {
  const [state, setState] = useState({
    gastos: [],
    ingresos: [],
    movimientos: [],
    categorias: [],
    resumenMensual: null,
    estadisticas: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      limit: 20,
      offset: 0
    }
  });

  // ===== GESTIÓN DE GASTOS =====

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

  // ✅ OBTENER GASTOS
  const getGastos = async (filtros = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.offset) params.append('offset', filtros.offset);
      if (filtros.camion_id) params.append('camion_id', filtros.camion_id);
      if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.mes) params.append('mes', filtros.mes);
      if (filtros.año) params.append('año', filtros.año);
      
      const url = `/dinero/gastos${params.toString() ? `?${params.toString()}` : ''}`;
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

  // ===== GESTIÓN DE INGRESOS =====

  // ✅ CREAR NUEVO INGRESO
  const createIngreso = async (ingresoData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('💰 Creando ingreso:', ingresoData);
      const response = await axiosAuth.post('/dinero/ingresos', ingresoData);
      
      // Actualizar lista local
      setState(prev => ({ 
        ...prev, 
        ingresos: [response.data.ingreso, ...prev.ingresos],
        loading: false 
      }));
      
      toast.success('Ingreso registrado exitosamente');
      console.log('✅ Ingreso creado:', response.data.ingreso);
      
      return { success: true, data: response.data.ingreso };
      
    } catch (error) {
      console.error('❌ Error creando ingreso:', error);
      const errorMessage = error.response?.data?.message || 'Error registrando ingreso';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER INGRESOS
  const getIngresos = async (filtros = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros (mismos que gastos)
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.offset) params.append('offset', filtros.offset);
      if (filtros.camion_id) params.append('camion_id', filtros.camion_id);
      if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.mes) params.append('mes', filtros.mes);
      if (filtros.año) params.append('año', filtros.año);
      
      const url = `/dinero/ingresos${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('💰 Obteniendo ingresos de:', url);
      
      const response = await axiosAuth.get(url);
      
      setState(prev => ({ 
        ...prev, 
        ingresos: response.data.ingresos,
        pagination: {
          total: response.data.total,
          limit: response.data.limit,
          offset: response.data.offset
        },
        loading: false 
      }));
      
      console.log('✅ Ingresos obtenidos:', response.data.ingresos.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo ingresos:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo ingresos';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ ACTUALIZAR INGRESO
  const updateIngreso = async (id, ingresoData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('💰 Actualizando ingreso ID:', id, ingresoData);
      const response = await axiosAuth.put(`/dinero/ingresos/${id}`, ingresoData);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        ingresos: prev.ingresos.map(ingreso => 
          ingreso.id === id ? response.data.ingreso : ingreso
        ),
        loading: false
      }));
      
      toast.success('Ingreso actualizado exitosamente');
      console.log('✅ Ingreso actualizado:', response.data.ingreso);
      
      return { success: true, data: response.data.ingreso };
      
    } catch (error) {
      console.error('❌ Error actualizando ingreso:', error);
      const errorMessage = error.response?.data?.message || 'Error actualizando ingreso';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ ELIMINAR INGRESO
  const deleteIngreso = async (id) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🗑️ Eliminando ingreso ID:', id);
      const response = await axiosAuth.delete(`/dinero/ingresos/${id}`);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        ingresos: prev.ingresos.filter(ingreso => ingreso.id !== id),
        loading: false
      }));
      
      toast.success('Ingreso eliminado exitosamente');
      console.log('✅ Ingreso eliminado:', id);
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error eliminando ingreso:', error);
      const errorMessage = error.response?.data?.message || 'Error eliminando ingreso';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ===== RESÚMENES Y ESTADÍSTICAS =====

  // ✅ OBTENER RESUMEN MENSUAL
  const getResumenMensual = async (año, mes) => {
    try {
      const params = new URLSearchParams();
      if (año) params.append('año', año);
      if (mes) params.append('mes', mes);
      
      console.log('📊 Obteniendo resumen mensual...');
      const response = await axiosAuth.get(`/dinero/resumen-mensual?${params.toString()}`);
      
      setState(prev => ({ 
        ...prev, 
        resumenMensual: response.data 
      }));
      
      console.log('✅ Resumen mensual obtenido:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo resumen mensual:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo resumen';
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER MOVIMIENTOS UNIFICADOS
  const getMovimientos = async (filtros = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.offset) params.append('offset', filtros.offset);
      if (filtros.camion_id) params.append('camion_id', filtros.camion_id);
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      
      console.log('📋 Obteniendo movimientos...');
      const response = await axiosAuth.get(`/dinero/movimientos?${params.toString()}`);
      
      setState(prev => ({ 
        ...prev, 
        movimientos: response.data.movimientos,
        loading: false 
      }));
      
      console.log('✅ Movimientos obtenidos:', response.data.movimientos.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo movimientos:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo movimientos';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER CATEGORÍAS
  const getCategorias = async (tipo = null) => {
    try {
      const params = tipo ? `?tipo=${tipo}` : '';
      console.log('🏷️ Obteniendo categorías...');
      
      const response = await axiosAuth.get(`/dinero/categorias${params}`);
      
      setState(prev => ({ 
        ...prev, 
        categorias: response.data 
      }));
      
      console.log('✅ Categorías obtenidas:', response.data.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo categorías';
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER ESTADÍSTICAS GENERALES
  const getEstadisticas = async () => {
    try {
      console.log('📊 Obteniendo estadísticas generales...');
      const response = await axiosAuth.get('/dinero/estadisticas');
      
      setState(prev => ({ 
        ...prev, 
        estadisticas: response.data 
      }));
      
      console.log('✅ Estadísticas obtenidas:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo estadísticas';
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ RECARGAR DATOS
  const refresh = async () => {
    console.log('🔄 Recargando datos de dinero...');
    await Promise.all([
      getEstadisticas(),
      getCategorias(),
      getResumenMensual()
    ]);
  };

  // ✅ LIMPIAR ERRORES
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // ✅ CARGAR AUTOMÁTICAMENTE AL MONTAR
  useEffect(() => {
    if (autoLoad) {
      console.log('🚀 Cargando datos de dinero automáticamente...');
      refresh();
    }
  }, [autoLoad]);

  return {
    // Estado
    ...state,
    
    // Acciones de gastos
    createGasto,
    getGastos,
    updateGasto,
    deleteGasto,
    
    // Acciones de ingresos
    createIngreso,
    getIngresos,
    updateIngreso,
    deleteIngreso,
    
    // Resúmenes y estadísticas
    getResumenMensual,
    getMovimientos,
    getCategorias,
    getEstadisticas,
    
    // Utilidades
    refresh,
    clearError,
    
    // Cálculos útiles
    totalGastos: state.gastos.reduce((sum, gasto) => sum + parseFloat(gasto.total || 0), 0),
    totalIngresos: state.ingresos.reduce((sum, ingreso) => sum + parseFloat(ingreso.total || 0), 0),
    balance: state.ingresos.reduce((sum, ingreso) => sum + parseFloat(ingreso.total || 0), 0) - 
             state.gastos.reduce((sum, gasto) => sum + parseFloat(gasto.total || 0), 0),
    
    // Paginación
    hasNextPage: (state.pagination.offset + state.pagination.limit) < state.pagination.total,
    hasPrevPage: state.pagination.offset > 0,
    currentPage: Math.floor(state.pagination.offset / state.pagination.limit) + 1,
    totalPages: Math.ceil(state.pagination.total / state.pagination.limit)
  };
};