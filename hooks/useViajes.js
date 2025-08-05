// hooks/useViajes.js - SISTEMA DE FLETES
import { useState, useEffect } from 'react';
import { axiosAuth } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

export const useViajes = (autoLoad = true) => {
  const [state, setState] = useState({
    viajes: [],
    viajesActivos: [],
    estadisticas: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      limit: 20,
      offset: 0
    }
  });

  // ✅ OBTENER TODOS LOS VIAJES
  const getViajes = async (filtros = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros si existen
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.offset) params.append('offset', filtros.offset);
      if (filtros.camion_id) params.append('camion_id', filtros.camion_id);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.mes) params.append('mes', filtros.mes);
      if (filtros.año) params.append('año', filtros.año);
      
      const queryString = params.toString();
      const url = `/viajes${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Obteniendo viajes de:', url);
      const response = await axiosAuth.get(url);
      
      setState(prev => ({ 
        ...prev, 
        viajes: response.data.viajes,
        pagination: {
          total: response.data.total,
          limit: response.data.limit,
          offset: response.data.offset
        },
        loading: false 
      }));
      
      console.log('✅ Viajes obtenidos:', response.data.viajes.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo viajes:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo viajes';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER VIAJES ACTIVOS
  const getViajesActivos = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔍 Obteniendo viajes activos...');
      const response = await axiosAuth.get('/viajes/activos');
      
      setState(prev => ({ 
        ...prev, 
        viajesActivos: response.data,
        loading: false 
      }));
      
      console.log('✅ Viajes activos obtenidos:', response.data.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo viajes activos:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo viajes activos';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER UN VIAJE POR ID
  const getViajeById = async (id) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔍 Obteniendo viaje ID:', id);
      const response = await axiosAuth.get(`/viajes/${id}`);
      
      setState(prev => ({ ...prev, loading: false }));
      
      console.log('✅ Viaje obtenido:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo viaje:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo viaje';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ CREAR NUEVO VIAJE
  const createViaje = async (viajeData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📝 Creando viaje:', viajeData);
      const response = await axiosAuth.post('/viajes', viajeData);
      
      // Actualizar lista local de viajes
      setState(prev => ({ 
        ...prev, 
        viajes: [response.data.viaje, ...prev.viajes],
        loading: false 
      }));
      
      // Actualizar lista de viajes activos
      await getViajesActivos();
      
      toast.success('Viaje iniciado exitosamente');
      console.log('✅ Viaje creado:', response.data.viaje);
      
      return { success: true, data: response.data.viaje };
      
    } catch (error) {
      console.error('❌ Error creando viaje:', error);
      const errorMessage = error.response?.data?.message || 'Error iniciando viaje';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ FINALIZAR VIAJE
  const finalizarViaje = async (id, datosFinales) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🏁 Finalizando viaje ID:', id, datosFinales);
      const response = await axiosAuth.put(`/viajes/${id}/finalizar`, datosFinales);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        viajes: prev.viajes.map(viaje => 
          viaje.id === id ? response.data.viaje : viaje
        ),
        viajesActivos: prev.viajesActivos.filter(viaje => viaje.id !== id),
        loading: false
      }));
      
      // Mostrar mensaje de éxito con información del ingreso creado
      if (response.data.ingreso_creado) {
        toast.success(
          `Viaje finalizado. Ingreso de $${response.data.ingreso_creado.total.toLocaleString()} registrado automáticamente.`
        );
      } else {
        toast.success('Viaje finalizado exitosamente');
      }
      
      console.log('✅ Viaje finalizado:', response.data.viaje);
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error finalizando viaje:', error);
      const errorMessage = error.response?.data?.message || 'Error finalizando viaje';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ CANCELAR VIAJE
  const cancelarViaje = async (id, motivoCancelacion) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('❌ Cancelando viaje ID:', id, motivoCancelacion);
      const response = await axiosAuth.put(`/viajes/${id}/cancelar`, {
        motivo_cancelacion: motivoCancelacion
      });
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        viajes: prev.viajes.map(viaje => 
          viaje.id === id ? { ...viaje, estado: 'CANCELADO' } : viaje
        ),
        viajesActivos: prev.viajesActivos.filter(viaje => viaje.id !== id),
        loading: false
      }));
      
      toast.success('Viaje cancelado exitosamente');
      console.log('✅ Viaje cancelado:', id);
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error cancelando viaje:', error);
      const errorMessage = error.response?.data?.message || 'Error cancelando viaje';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER ESTADÍSTICAS
  const getEstadisticas = async () => {
    try {
      console.log('📊 Obteniendo estadísticas de viajes...');
      const response = await axiosAuth.get('/viajes/estadisticas');
      
      setState(prev => ({ 
        ...prev, 
        estadisticas: response.data 
      }));
      
      console.log('✅ Estadísticas obtenidas:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo estadísticas';
      
      // No mostrar toast para estadísticas, es información secundaria
      return { success: false, error: errorMessage };
    }
  };

  // ✅ FILTRAR VIAJES POR CAMIÓN
  const getViajesByCamion = async (camionId, filtros = {}) => {
    return await getViajes({ ...filtros, camion_id: camionId });
  };

  // ✅ FILTRAR VIAJES POR ESTADO
  const getViajesByEstado = async (estado, filtros = {}) => {
    return await getViajes({ ...filtros, estado });
  };

  // ✅ CAMBIAR PÁGINA
  const changePage = async (newOffset, filtros = {}) => {
    await getViajes({ ...filtros, offset: newOffset });
  };

  // ✅ RECARGAR DATOS
  const refresh = async () => {
    console.log('🔄 Recargando datos de viajes...');
    await Promise.all([
      getViajes(),
      getViajesActivos(),
      getEstadisticas()
    ]);
  };

  // ✅ LIMPIAR ERRORES
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // ✅ CARGAR AUTOMÁTICAMENTE AL MONTAR
  useEffect(() => {
    if (autoLoad) {
      console.log('🚀 Cargando viajes automáticamente...');
      refresh();
    }
  }, [autoLoad]);

  return {
    // Estado
    ...state,
    
    // Acciones
    getViajes,
    getViajesActivos,
    getViajeById,
    createViaje,
    finalizarViaje,
    cancelarViaje,
    getEstadisticas,
    getViajesByCamion,
    getViajesByEstado,
    changePage,
    refresh,
    clearError,
    
    // Utilidades
    totalViajes: state.viajes.length,
    viajesActivosCount: state.viajesActivos.length,
    viajesCompletados: state.viajes.filter(v => v.estado === 'COMPLETADO').length,
    viajesCancelados: state.viajes.filter(v => v.estado === 'CANCELADO').length,
    viajesPendientes: state.viajes.filter(v => v.estado === 'PENDIENT  E').length,
    viajesEnCurso: state.viajes.filter(v => v.estado === 'EN CURSO').length,
    viajesPorCamion: (camionId) => state.viajes.filter(v => v.camion_id === camionId),
    viajesPorEstado: (estado) => state.viajes.filter(v => v.estado ===  estado),
    viajesPorFecha: (fecha) => state.viajes.filter(v => new Date(v  .fecha) >= new Date(fecha)),
    viajesPorMes: (mes) => state.viajes.filter(v => new Date(v.fecha).getMonth() + 1 === mes),
    viajesPorAño: (año) => state.viajes.filter(v => new Date(v.fecha).getFullYear() === año),
    viajesPorCamionYEstado: (camionId, estado) => state.viajes.filter(v => v.camion_id === camionId && v.estado === estado),
    viajesPorFechaYEstado: (fecha, estado) => state.viajes.filter(v => new Date(v.fecha) >= new Date(fecha) && v.estado === estado),
    viajesPorMesYEstado: (mes, estado) => state.viajes.filter(v => new Date(v.fecha).getMonth() + 1 === mes && v.estado === estado),
    viajesPorAñoYEstado: (año, estado) => state.viajes.filter(v => new Date(v.fecha).getFullYear() === año && v.estado === estado)
  };
}