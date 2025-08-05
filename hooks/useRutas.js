// hooks/useRutas.js - SISTEMA DE FLETES
import { useState, useEffect } from 'react';
import { axiosAuth } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

export const useRutas = (autoLoad = true) => {
  const [state, setState] = useState({
    rutas: [],
    rutasRentables: [],
    estadisticas: null,
    loading: false,
    error: null
  });

  // ✅ OBTENER TODAS LAS RUTAS
  const getRutas = async (filtros = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      
      if (filtros.activo !== undefined) {
        params.append('activo', filtros.activo);
      }
      
      const queryString = params.toString();
      const url = `/viajes/rutas${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Obteniendo rutas de:', url);
      const response = await axiosAuth.get(url);
      
      setState(prev => ({ 
        ...prev, 
        rutas: response.data, 
        loading: false 
      }));
      
      console.log('✅ Rutas obtenidas:', response.data.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo rutas:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo rutas';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER UNA RUTA POR ID
  const getRutaById = async (id) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔍 Obteniendo ruta ID:', id);
      const response = await axiosAuth.get(`/viajes/rutas/${id}`);
      
      setState(prev => ({ ...prev, loading: false }));
      
      console.log('✅ Ruta obtenida:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo ruta:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo ruta';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ CREAR NUEVA RUTA
  const createRuta = async (rutaData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📝 Creando ruta:', rutaData);
      const response = await axiosAuth.post('/viajes/rutas', rutaData);
      
      // Actualizar lista local
      setState(prev => ({ 
        ...prev, 
        rutas: [response.data.ruta, ...prev.rutas],
        loading: false 
      }));
      
      toast.success('Ruta creada exitosamente');
      console.log('✅ Ruta creada:', response.data.ruta);
      
      return { success: true, data: response.data.ruta };
      
    } catch (error) {
      console.error('❌ Error creando ruta:', error);
      const errorMessage = error.response?.data?.message || 'Error creando ruta';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ ACTUALIZAR RUTA
  const updateRuta = async (id, rutaData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📝 Actualizando ruta ID:', id, rutaData);
      const response = await axiosAuth.put(`/viajes/rutas/${id}`, rutaData);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        rutas: prev.rutas.map(ruta => 
          ruta.id === id ? response.data.ruta : ruta
        ),
        loading: false
      }));
      
      toast.success('Ruta actualizada exitosamente');
      console.log('✅ Ruta actualizada:', response.data.ruta);
      
      return { success: true, data: response.data.ruta };
      
    } catch (error) {
      console.error('❌ Error actualizando ruta:', error);
      const errorMessage = error.response?.data?.message || 'Error actualizando ruta';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ ELIMINAR RUTA
  const deleteRuta = async (id) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🗑️ Eliminando ruta ID:', id);
      const response = await axiosAuth.delete(`/viajes/rutas/${id}`);
      
      // Actualizar lista local
      if (response.data.tipo === 'hard_delete') {
        setState(prev => ({
          ...prev,
          rutas: prev.rutas.filter(ruta => ruta.id !== id),
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          rutas: prev.rutas.map(ruta => 
            ruta.id === id ? { ...ruta, activo: 0 } : ruta
          ),
          loading: false
        }));
      }
      
      toast.success(response.data.message);
      console.log('✅ Ruta eliminada:', id);
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error eliminando ruta:', error);
      const errorMessage = error.response?.data?.message || 'Error eliminando ruta';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER RUTAS MÁS RENTABLES
  const getRutasRentables = async (limit = 10) => {
    try {
      console.log('💰 Obteniendo rutas rentables...');
      const response = await axiosAuth.get(`/viajes/rutas/rentables?limit=${limit}`);
      
      setState(prev => ({ 
        ...prev, 
        rutasRentables: response.data 
      }));
      
      console.log('✅ Rutas rentables obtenidas:', response.data.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo rutas rentables:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo rutas rentables';
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER ESTADÍSTICAS DE RUTAS
  const getEstadisticas = async () => {
    try {
      console.log('📊 Obteniendo estadísticas de rutas...');
      const response = await axiosAuth.get('/viajes/rutas/estadisticas');
      
      setState(prev => ({ 
        ...prev, 
        estadisticas: response.data 
      }));
      
      console.log('✅ Estadísticas de rutas obtenidas:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo estadísticas';
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER RUTAS ACTIVAS (para selección en formularios)
  const getRutasActivas = async () => {
    const result = await getRutas({ activo: true });
    
    if (result.success) {
      const activas = result.data.filter(ruta => ruta.activo);
      return { success: true, data: activas };
    }
    
    return result;
  };

  // ✅ RECARGAR DATOS
  const refresh = async () => {
    console.log('🔄 Recargando datos de rutas...');
    await Promise.all([
      getRutas(),
      getRutasRentables(),
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
      console.log('🚀 Cargando rutas automáticamente...');
      refresh();
    }
  }, [autoLoad]);

  return {
    // Estado
    ...state,
    
    // Acciones
    getRutas,
    getRutaById,
    createRuta,
    updateRuta,
    deleteRuta,
    getRutasRentables,
    getEstadisticas,
    getRutasActivas,
    refresh,
    clearError,
    
    // Utilidades
    totalRutas: state.rutas.length,
    rutasActivas: state.rutas.filter(r => r.activo).length,
    rutasInactivas: state.rutas.filter(r => !r.activo).length,
    rutasConViajes: state.rutas.filter(r => r.total_viajes > 0).length
  };
};