// hooks/useReportes.js - SISTEMA DE FLETES
import { useState, useEffect } from 'react';
import { axiosAuth } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

export const useReportes = (autoLoad = true) => {
  const [state, setState] = useState({
    dashboard: null,
    reportesCamiones: [],
    reportesRutas: [],
    reporteMensual: null,
    loading: false,
    error: null
  });

  // ✅ OBTENER DASHBOARD PRINCIPAL
  const getDashboard = async (año, mes) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      if (año) params.append('año', año);
      if (mes) params.append('mes', mes);
      
      console.log('📊 Obteniendo dashboard de reportes...');
      const response = await axiosAuth.get(`/reportes/dashboard?${params.toString()}`);
      
      setState(prev => ({ 
        ...prev, 
        dashboard: response.data,
        loading: false 
      }));
      
      console.log('✅ Dashboard de reportes obtenido:', response.data);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo dashboard:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo dashboard';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER REPORTE POR CAMIÓN
  const getReportePorCamion = async (año, mes) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      if (año) params.append('año', año);
      if (mes) params.append('mes', mes);
      
      console.log('🚛 Obteniendo reporte por camión...');
      const response = await axiosAuth.get(`/reportes/por-camion?${params.toString()}`);
      
      setState(prev => ({ 
        ...prev, 
        reportesCamiones: response.data.camiones || [],
        loading: false 
      }));
      
      console.log('✅ Reporte por camión obtenido:', response.data.camiones?.length || 0, 'camiones');
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte por camión:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo reporte por camión';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER REPORTE DE RUTAS
  const getReporteRutas = async (limit = 10) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🗺️ Obteniendo reporte de rutas...');
      const response = await axiosAuth.get(`/reportes/rutas?limit=${limit}`);
      
      setState(prev => ({ 
        ...prev, 
        reportesRutas: response.data.rutas || [],
        loading: false 
      }));
      
      console.log('✅ Reporte de rutas obtenido:', response.data.rutas?.length || 0, 'rutas');
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte de rutas:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo reporte de rutas';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER REPORTE MENSUAL
  const getReporteMensual = async (año) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = año ? `?año=${año}` : '';
      
      console.log('📅 Obteniendo reporte mensual...');
      const response = await axiosAuth.get(`/reportes/mensual${params}`);
      
      setState(prev => ({ 
        ...prev, 
        reporteMensual: response.data,
        loading: false 
      }));
      
      console.log('✅ Reporte mensual obtenido:', response.data.meses?.length || 0, 'meses');
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte mensual:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo reporte mensual';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ CARGAR TODOS LOS REPORTES PARA EL MES ACTUAL
  const loadAllReportes = async (año, mes) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📊 Cargando todos los reportes...');
      
      const [dashboardResult, camionesResult, rutasResult] = await Promise.allSettled([
        getDashboard(año, mes),
        getReportePorCamion(año, mes), 
        getReporteRutas(10)
      ]);
      
      // Verificar si algún reporte falló
      const hasErrors = [dashboardResult, camionesResult, rutasResult]
        .some(result => result.status === 'rejected' || !result.value?.success);
      
      if (hasErrors) {
        console.warn('⚠️ Algunos reportes fallaron al cargar');
        toast.error('Algunos reportes no se pudieron cargar completamente');
      } else {
        console.log('✅ Todos los reportes cargados exitosamente');
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return { success: !hasErrors };
      
    } catch (error) {
      console.error('❌ Error cargando reportes:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error cargando reportes', 
        loading: false 
      }));
      
      toast.error('Error cargando reportes');
      return { success: false, error: 'Error cargando reportes' };
    }
  };

  // ✅ LIMPIAR ERRORES
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // ✅ RECARGAR TODOS LOS DATOS
  const refresh = async () => {
    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1;
    
    console.log('🔄 Recargando todos los reportes...');
    return await loadAllReportes(año, mes);
  };

  // ✅ CARGAR AUTOMÁTICAMENTE AL MONTAR
  useEffect(() => {
    if (autoLoad) {
      const fechaActual = new Date();
      const año = fechaActual.getFullYear();
      const mes = fechaActual.getMonth() + 1;
      
      console.log('🚀 Cargando reportes automáticamente...');
      loadAllReportes(año, mes);
    }
  }, [autoLoad]);

  return {
    // Estado
    ...state,
    
    // Acciones principales
    getDashboard,
    getReportePorCamion,
    getReporteRutas,
    getReporteMensual,
    loadAllReportes,
    refresh,
    clearError,
    
    // Utilidades
    hasData: !!(state.dashboard || state.reportesCamiones.length > 0 || state.reportesRutas.length > 0),
    totalCamiones: state.reportesCamiones.length,
    totalRutas: state.reportesRutas.length,
    mesActual: state.dashboard?.mes || new Date().getMonth() + 1,
    añoActual: state.dashboard?.año || new Date().getFullYear(),
    
    // Estadísticas rápidas del dashboard
    estadisticasRapidas: state.dashboard?.estadisticas_rapidas || null,
    resumenFinanciero: state.dashboard?.resumen_financiero || null
  };
};