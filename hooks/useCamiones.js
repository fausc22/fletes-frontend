// hooks/useCamiones.js - SISTEMA DE FLETES - CORREGIDO
import { useState, useEffect } from 'react';
import { axiosAuth } from '../utils/apiClient'; // ✅ IMPORTAR DIRECTAMENTE axiosAuth
import { toast } from 'react-hot-toast';

export const useCamiones = (autoLoad = true) => {
  const [state, setState] = useState({
    camiones: [],
    loading: false,
    error: null,
    estadisticas: null
  });

  // ✅ OBTENER TODOS LOS CAMIONES
  const getCamiones = async (filtros = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros si existen
      if (filtros.activo !== undefined) {
        params.append('activo', filtros.activo);
      }
      
      const queryString = params.toString();
      const url = `/camiones${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Obteniendo camiones de:', url);
      const response = await axiosAuth.get(url); // ✅ USAR axiosAuth DIRECTAMENTE
      
      setState(prev => ({ 
        ...prev, 
        camiones: response.data, 
        loading: false 
      }));
      
      console.log('✅ Camiones obtenidos:', response.data.length);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo camiones:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo camiones';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER UN CAMIÓN POR ID
  const getCamionById = async (id) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔍 Obteniendo camión ID:', id);
      const response = await axiosAuth.get(`/camiones/${id}`);
      
      setState(prev => ({ ...prev, loading: false }));
      
      console.log('✅ Camión obtenido:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo camión:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo camión';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ CREAR NUEVO CAMIÓN
  const createCamion = async (camionData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📝 Creando camión:', camionData);
      const response = await axiosAuth.post('/camiones', camionData);
      
      // Actualizar lista local
      setState(prev => ({ 
        ...prev, 
        camiones: [response.data.camion, ...prev.camiones],
        loading: false 
      }));
      
      toast.success('Camión creado exitosamente');
      console.log('✅ Camión creado:', response.data.camion);
      
      return { success: true, data: response.data.camion };
      
    } catch (error) {
      console.error('❌ Error creando camión:', error);
      const errorMessage = error.response?.data?.message || 'Error creando camión';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ ACTUALIZAR CAMIÓN
  const updateCamion = async (id, camionData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📝 Actualizando camión ID:', id, camionData);
      const response = await axiosAuth.put(`/camiones/${id}`, camionData);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        camiones: prev.camiones.map(camion => 
          camion.id === id ? response.data.camion : camion
        ),
        loading: false
      }));
      
      toast.success('Camión actualizado exitosamente');
      console.log('✅ Camión actualizado:', response.data.camion);
      
      return { success: true, data: response.data.camion };
      
    } catch (error) {
      console.error('❌ Error actualizando camión:', error);
      const errorMessage = error.response?.data?.message || 'Error actualizando camión';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ ELIMINAR CAMIÓN
  const deleteCamion = async (id) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🗑️ Eliminando camión ID:', id);
      const response = await axiosAuth.delete(`/camiones/${id}`);
      
      // Actualizar lista local
      if (response.data.tipo === 'hard_delete') {
        // Remover de la lista
        setState(prev => ({
          ...prev,
          camiones: prev.camiones.filter(camion => camion.id !== id),
          loading: false
        }));
      } else {
        // Soft delete - marcar como inactivo
        setState(prev => ({
          ...prev,
          camiones: prev.camiones.map(camion => 
            camion.id === id ? { ...camion, activo: 0 } : camion
          ),
          loading: false
        }));
      }
      
      toast.success(response.data.message);
      console.log('✅ Camión eliminado:', id);
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error eliminando camión:', error);
      const errorMessage = error.response?.data?.message || 'Error eliminando camión';
      
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
      console.log('📊 Obteniendo estadísticas de camiones...');
      const response = await axiosAuth.get('/camiones/estadisticas');
      
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

  // ✅ OBTENER CAMIONES DISPONIBLES (sin viajes activos)
  const getCamionesDisponibles = async () => {
    const result = await getCamiones({ activo: true });
    
    if (result.success) {
      const disponibles = result.data.filter(camion => !camion.tiene_viaje_activo);
      return { success: true, data: disponibles };
    }
    
    return result;
  };

  // ✅ RECARGAR DATOS
  const refresh = async () => {
    console.log('🔄 Recargando datos de camiones...');
    await getCamiones();
    await getEstadisticas();
  };

  // ✅ LIMPIAR ERRORES
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // ✅ CARGAR AUTOMÁTICAMENTE AL MONTAR
  useEffect(() => {
    if (autoLoad) {
      console.log('🚀 Cargando camiones automáticamente...');
      getCamiones();
      getEstadisticas();
    }
  }, [autoLoad]);

  return {
    // Estado
    ...state,
    
    // Acciones
    getCamiones,
    getCamionById,
    createCamion,
    updateCamion,
    deleteCamion,
    getEstadisticas,
    getCamionesDisponibles,
    refresh,
    clearError,
    
    // Utilidades
    totalCamiones: state.camiones.length,
    camionesActivos: state.camiones.filter(c => c.activo).length,
    camionesEnViaje: state.camiones.filter(c => c.tiene_viaje_activo).length,
    camionesDisponibles: state.camiones.filter(c => c.activo && !c.tiene_viaje_activo).length
  };
};