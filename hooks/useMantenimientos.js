// hooks/useMantenimientos.js - SISTEMA DE FLETES - CORREGIDO
import { useState, useEffect } from 'react';
import { axiosAuth } from '../utils/apiClient'; // ✅ IMPORTAR DIRECTAMENTE axiosAuth
import { toast } from 'react-hot-toast';

export const useMantenimientos = (camionId = null, autoLoad = true) => {
  const [state, setState] = useState({
    mantenimientos: [],
    alertas: [],
    estadisticas: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      limit: 10,
      offset: 0
    }
  });

  // ✅ OBTENER MANTENIMIENTOS POR CAMIÓN
  const getMantenimientosByCamion = async (camionIdParam, options = {}) => {
    const targetCamionId = camionIdParam || camionId;
    if (!targetCamionId) {
      console.error('❌ Se requiere camionId para obtener mantenimientos');
      return { success: false, error: 'Se requiere ID de camión' };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      params.append('limit', options.limit || state.pagination.limit);
      params.append('offset', options.offset || 0);
      
      console.log('🔍 Obteniendo mantenimientos para camión:', targetCamionId);
      const response = await axiosAuth.get(
        `/camiones/${targetCamionId}/mantenimientos?${params.toString()}`
      );
      
      setState(prev => ({ 
        ...prev, 
        mantenimientos: response.data.mantenimientos,
        pagination: {
          total: response.data.total,
          limit: response.data.limit,
          offset: response.data.offset
        },
        loading: false 
      }));
      
      console.log('✅ Mantenimientos obtenidos:', response.data.mantenimientos.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo mantenimientos:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo mantenimientos';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ CREAR NUEVO MANTENIMIENTO
  const createMantenimiento = async (camionIdParam, mantenimientoData) => {
    const targetCamionId = camionIdParam || camionId;
    if (!targetCamionId) {
      const error = 'Se requiere ID de camión';
      toast.error(error);
      return { success: false, error };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📝 Creando mantenimiento para camión:', targetCamionId, mantenimientoData);
      const response = await axiosAuth.post(
        `/camiones/${targetCamionId}/mantenimientos`, 
        mantenimientoData
      );
      
      // Actualizar lista local
      setState(prev => ({ 
        ...prev, 
        mantenimientos: [response.data.mantenimiento, ...prev.mantenimientos],
        loading: false 
      }));
      
      toast.success('Mantenimiento registrado exitosamente');
      console.log('✅ Mantenimiento creado:', response.data.mantenimiento);
      
      return { success: true, data: response.data.mantenimiento };
      
    } catch (error) {
      console.error('❌ Error creando mantenimiento:', error);
      const errorMessage = error.response?.data?.message || 'Error registrando mantenimiento';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER TODOS LOS MANTENIMIENTOS
  const getAllMantenimientos = async (filtros = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.offset) params.append('offset', filtros.offset);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      
      console.log('🔍 Obteniendo todos los mantenimientos...');
      const response = await axiosAuth.get(
        `/camiones/mantenimientos/todos?${params.toString()}`
      );
      
      setState(prev => ({ 
        ...prev, 
        mantenimientos: response.data.mantenimientos,
        pagination: {
          total: response.data.total,
          limit: response.data.limit,
          offset: response.data.offset
        },
        loading: false 
      }));
      
      console.log('✅ Todos los mantenimientos obtenidos:', response.data.mantenimientos.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo todos los mantenimientos:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo mantenimientos';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER PRÓXIMOS MANTENIMIENTOS (ALERTAS)
  const getAlertas = async () => {
    try {
      console.log('🚨 Obteniendo alertas de mantenimiento...');
      const response = await axiosAuth.get('/camiones/mantenimientos/proximos');
      
      setState(prev => ({ 
        ...prev, 
        alertas: response.data 
      }));
      
      console.log('✅ Alertas obtenidas:', response.data.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo alertas:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo alertas';
      
      // No mostrar toast para alertas, es información secundaria
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER ESTADÍSTICAS
  const getEstadisticas = async () => {
    try {
      console.log('📊 Obteniendo estadísticas de mantenimientos...');
      const response = await axiosAuth.get('/camiones/mantenimientos/estadisticas');
      
      setState(prev => ({ 
        ...prev, 
        estadisticas: response.data 
      }));
      
      console.log('✅ Estadísticas de mantenimientos obtenidas:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo estadísticas';
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ ACTUALIZAR MANTENIMIENTO
  const updateMantenimiento = async (id, mantenimientoData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📝 Actualizando mantenimiento ID:', id, mantenimientoData);
      const response = await axiosAuth.put(
        `/camiones/mantenimientos/${id}`, 
        mantenimientoData
      );
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        mantenimientos: prev.mantenimientos.map(mantenimiento => 
          mantenimiento.id === id ? response.data.mantenimiento : mantenimiento
        ),
        loading: false
      }));
      
      toast.success('Mantenimiento actualizado exitosamente');
      console.log('✅ Mantenimiento actualizado:', response.data.mantenimiento);
      
      return { success: true, data: response.data.mantenimiento };
      
    } catch (error) {
      console.error('❌ Error actualizando mantenimiento:', error);
      const errorMessage = error.response?.data?.message || 'Error actualizando mantenimiento';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ ELIMINAR MANTENIMIENTO
  const deleteMantenimiento = async (id) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🗑️ Eliminando mantenimiento ID:', id);
      const response = await axiosAuth.delete(`/camiones/mantenimientos/${id}`);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        mantenimientos: prev.mantenimientos.filter(mantenimiento => mantenimiento.id !== id),
        loading: false
      }));
      
      toast.success('Mantenimiento eliminado exitosamente');
      console.log('✅ Mantenimiento eliminado:', id);
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error eliminando mantenimiento:', error);
      const errorMessage = error.response?.data?.message || 'Error eliminando mantenimiento';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ CAMBIAR PÁGINA
  const changePage = async (newOffset) => {
    if (camionId) {
      await getMantenimientosByCamion(camionId, { offset: newOffset });
    } else {
      await getAllMantenimientos({ offset: newOffset });
    }
  };

  // ✅ RECARGAR DATOS
  const refresh = async () => {
    console.log('🔄 Recargando datos de mantenimientos...');
    if (camionId) {
      await getMantenimientosByCamion(camionId);
    } else {
      await getAllMantenimientos();
    }
    await getAlertas();
    await getEstadisticas();
  };

  // ✅ LIMPIAR ERRORES
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // ✅ CARGAR AUTOMÁTICAMENTE AL MONTAR
  useEffect(() => {
    if (autoLoad) {
      console.log('🚀 Cargando mantenimientos automáticamente...');
      if (camionId) {
        getMantenimientosByCamion(camionId);
      }
      getAlertas();
      getEstadisticas();
    }
  }, [camionId, autoLoad]);

  return {
    // Estado
    ...state,
    
    // Acciones
    getMantenimientosByCamion,
    createMantenimiento,
    getAllMantenimientos,
    getAlertas,
    getEstadisticas,
    updateMantenimiento,
    deleteMantenimiento,
    changePage,
    refresh,
    clearError,
    
    // Utilidades
    totalMantenimientos: state.mantenimientos.length,
    alertasUrgentes: state.alertas.filter(a => a.prioridad === 'URGENTE').length,
    alertasProximas: state.alertas.filter(a => a.prioridad === 'PRÓXIMO').length,
    hasNextPage: (state.pagination.offset + state.pagination.limit) < state.pagination.total,
    hasPrevPage: state.pagination.offset > 0
  };
};