// hooks/useReporteCamiones.js - SISTEMA DE FLETES
import { useState, useEffect } from 'react';
import { axiosAuth } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

export const useReporteCamiones = (autoLoad = true) => {
  const [state, setState] = useState({
    reportesCamiones: [],
    camionSeleccionado: null,
    detalleCamion: null,
    comparativo: null,
    rankings: null,
    loading: false,
    error: null,
    filtros: {
      año: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      periodo: 'mes' // 'mes', 'trimestre', 'año'
    }
  });

  // ✅ OBTENER REPORTE COMPLETO POR CAMIONES
  const getReportePorCamiones = async (año = null, mes = null) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const añoConsulta = año || new Date().getFullYear();
      const mesConsulta = mes || new Date().getMonth() + 1;
      
      console.log(`🚛 Obteniendo reporte por camiones: ${añoConsulta}/${mesConsulta}`);
      const response = await axiosAuth.get(`/reportes/por-camion?año=${añoConsulta}&mes=${mesConsulta}`);
      
      // Procesar datos para análisis
      const datosProcessados = procesarDatosCamiones(response.data.camiones);
      
      setState(prev => ({ 
        ...prev, 
        reportesCamiones: response.data.camiones,
        rankings: datosProcessados.rankings,
        comparativo: datosProcessados.comparativo,
        filtros: {
          ...prev.filtros,
          año: añoConsulta,
          mes: mesConsulta
        },
        loading: false 
      }));
      
      console.log('✅ Reporte por camiones obtenido:', response.data.camiones?.length, 'camiones');
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte por camiones:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo reporte por camiones';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ OBTENER DETALLE ESPECÍFICO DE UN CAMIÓN
  const getDetalleCamion = async (camionId, periodo = '6m') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log(`🔍 Obteniendo detalle del camión ID: ${camionId}`);
      
      // Construir parámetros según el período
      const params = new URLSearchParams();
      
      if (periodo === 'mes') {
        params.append('año', state.filtros.año);
        params.append('mes', state.filtros.mes);
      } else if (periodo === '3m') {
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 3);
        params.append('desde', fechaInicio.toISOString().split('T')[0]);
      } else if (periodo === '6m') {
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 6);
        params.append('desde', fechaInicio.toISOString().split('T')[0]);
      }
      
      // Obtener datos básicos del camión
      const [camionResponse, viajesResponse, gastosResponse, ingresosResponse] = await Promise.all([
        axiosAuth.get(`/camiones/${camionId}`),
        axiosAuth.get(`/viajes?camion_id=${camionId}&${params.toString()}`),
        axiosAuth.get(`/dinero/gastos?camion_id=${camionId}&${params.toString()}`),
        axiosAuth.get(`/dinero/ingresos?camion_id=${camionId}&${params.toString()}`)
      ]);
      
      // Procesar detalle completo
      const detalleProcessado = procesarDetalleCamion({
        camion: camionResponse.data,
        viajes: viajesResponse.data.viajes,
        gastos: gastosResponse.data.gastos,
        ingresos: ingresosResponse.data.ingresos
      });
      
      setState(prev => ({ 
        ...prev, 
        camionSeleccionado: camionId,
        detalleCamion: detalleProcessado,
        loading: false 
      }));
      
      console.log('✅ Detalle del camión obtenido');
      return { success: true, data: detalleProcessado };
      
    } catch (error) {
      console.error('❌ Error obteniendo detalle del camión:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo detalle del camión';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ PROCESAR DATOS PARA ANÁLISIS COMPARATIVO
  const procesarDatosCamiones = (camionesData) => {
    if (!camionesData || camionesData.length === 0) {
      return { rankings: null, comparativo: null };
    }

    // Rankings por diferentes métricas
    const rankings = {
      porGanancia: [...camionesData].sort((a, b) => b.ganancia - a.ganancia),
      porIngresos: [...camionesData].sort((a, b) => b.ingresos - a.ingresos),
      porViajes: [...camionesData].sort((a, b) => b.viajes_mes - a.viajes_mes),
      porKilometros: [...camionesData].sort((a, b) => b.km_recorridos - a.km_recorridos),
      porRentabilidad: [...camionesData].sort((a, b) => b.rentabilidad - a.rentabilidad)
    };

    // Comparativo general
    const comparativo = {
      totalCamiones: camionesData.length,
      
      // Promedios
      promedioIngresos: Math.round(camionesData.reduce((sum, c) => sum + c.ingresos, 0) / camionesData.length),
      promedioGastos: Math.round(camionesData.reduce((sum, c) => sum + c.gastos, 0) / camionesData.length),
      promedioGanancia: Math.round(camionesData.reduce((sum, c) => sum + c.ganancia, 0) / camionesData.length),
      promedioViajes: Math.round(camionesData.reduce((sum, c) => sum + c.viajes_mes, 0) / camionesData.length),
      promedioKm: Math.round(camionesData.reduce((sum, c) => sum + c.km_recorridos, 0) / camionesData.length),
      
      // Distribución por clasificación
      distribución: {
        excelente: camionesData.filter(c => c.clasificacion === 'Excelente').length,
        muyBueno: camionesData.filter(c => c.clasificacion === 'Muy Bueno').length,
        bueno: camionesData.filter(c => c.clasificacion === 'Bueno').length,
        regular: camionesData.filter(c => c.clasificacion === 'Regular').length,
        malo: camionesData.filter(c => c.clasificacion === 'Malo').length
      },
      
      // Análisis de disparidad
      disparidad: calcularDisparidad(camionesData)
    };

    return { rankings, comparativo };
  };

  // ✅ PROCESAR DETALLE ESPECÍFICO DE CAMIÓN
  const procesarDetalleCamion = ({ camion, viajes, gastos, ingresos }) => {
    // Calcular métricas temporales
    const viajesPorMes = agruparPorMes(viajes, 'fecha_inicio');
    const gastosPorMes = agruparPorMes(gastos, 'fecha');
    const ingresosPorMes = agruparPorMes(ingresos, 'fecha');
    
    // Calcular tendencias
    const tendencias = calcularTendenciasCamion(viajesPorMes, gastosPorMes, ingresosPorMes);
    
    return {
      // Información básica
      camion,
      
      // Resúmenes
      resumen: {
        totalViajes: viajes.length,
        totalIngresos: ingresos.reduce((sum, i) => sum + parseFloat(i.total), 0),
        totalGastos: gastos.reduce((sum, g) => sum + parseFloat(g.total), 0),
        totalKm: viajes.filter(v => v.km_recorridos).reduce((sum, v) => sum + v.km_recorridos, 0),
        
        // Promedios
        promedioPorViaje: viajes.length > 0 ? 
          Math.round(ingresos.reduce((sum, i) => sum + parseFloat(i.total), 0) / viajes.length) : 0,
        promedioKmPorViaje: viajes.length > 0 ? 
          Math.round(viajes.filter(v => v.km_recorridos).reduce((sum, v) => sum + v.km_recorridos, 0) / viajes.length) : 0
      },
      
      // Datos temporales
      viajesPorMes,
      gastosPorMes,
      ingresosPorMes,
      
      // Análisis de tendencias
      tendencias,
      
      // Alertas y recomendaciones
      alertas: generarAlertasCamion(camion, viajes, gastos, ingresos),
      
      // Top gastos e ingresos
      topGastos: gastos.sort((a, b) => b.total - a.total).slice(0, 5),
      topIngresos: ingresos.sort((a, b) => b.total - a.total).slice(0, 5)
    };
  };

  // ✅ CALCULAR DISPARIDAD ENTRE CAMIONES
  const calcularDisparidad = (camiones) => {
    const ganancias = camiones.map(c => c.ganancia);
    const max = Math.max(...ganancias);
    const min = Math.min(...ganancias);
    const promedio = ganancias.reduce((a, b) => a + b, 0) / ganancias.length;
    
    return {
      rango: max - min,
      coeficienteVariacion: promedio > 0 ? Math.round((Math.sqrt(
        ganancias.reduce((sum, g) => sum + Math.pow(g - promedio, 2), 0) / ganancias.length
      ) / promedio) * 100) : 0,
      distribucionEquitativa: (max - min) / promedio < 1
    };
  };

  // ✅ AGRUPAR DATOS POR MES
  const agruparPorMes = (datos, campoFecha) => {
    const agrupados = {};
    
    datos.forEach(item => {
      const fecha = new Date(item[campoFecha]);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (!agrupados[clave]) {
        agrupados[clave] = [];
      }
      agrupados[clave].push(item);
    });
    
    return agrupados;
  };

  // ✅ CALCULAR TENDENCIAS ESPECÍFICAS DEL CAMIÓN
  const calcularTendenciasCamion = (viajes, gastos, ingresos) => {
    const mesesOrdenados = Object.keys(viajes).sort();
    
    if (mesesOrdenados.length < 2) return null;
    
    const tendenciaViajes = calcularTendenciaSimple(
      mesesOrdenados.map(mes => viajes[mes]?.length || 0)
    );
    
    const tendenciaGastos = calcularTendenciaSimple(
      mesesOrdenados.map(mes => gastos[mes]?.reduce((sum, g) => sum + parseFloat(g.total), 0) || 0)
    );
    
    const tendenciaIngresos = calcularTendenciaSimple(
      mesesOrdenados.map(mes => ingresos[mes]?.reduce((sum, i) => sum + parseFloat(i.total), 0) || 0)
    );
    
    return {
      viajes: tendenciaViajes,
      gastos: tendenciaGastos,
      ingresos: tendenciaIngresos,
      período: `${mesesOrdenados.length} meses`
    };
  };

  // ✅ CALCULAR TENDENCIA SIMPLE
  const calcularTendenciaSimple = (valores) => {
    if (valores.length < 2) return 'INSUFICIENTE';
    
    const primero = valores[0];
    const último = valores[valores.length - 1];
    
    if (último > primero * 1.1) return 'ASCENDENTE';
    if (último < primero * 0.9) return 'DESCENDENTE';
    return 'ESTABLE';
  };

  // ✅ GENERAR ALERTAS ESPECÍFICAS DEL CAMIÓN
  const generarAlertasCamion = (camion, viajes, gastos, ingresos) => {
    const alertas = [];
    
    // Alert por kilómetros altos
    if (camion.kilometros > 300000) {
      alertas.push({
        tipo: 'warning',
        mensaje: `Camión con ${camion.kilometros.toLocaleString()} km. Revisar mantenimientos preventivos.`
      });
    }
    
    // Alert por pocos viajes
    if (viajes.length < 5) {
      alertas.push({
        tipo: 'info',
        mensaje: `Solo ${viajes.length} viajes en el período. Evaluar disponibilidad y asignación.`
      });
    }
    
    // Alert por gastos altos
    const gastoPromedio = gastos.length > 0 ? 
      gastos.reduce((sum, g) => sum + parseFloat(g.total), 0) / gastos.length : 0;
    if (gastoPromedio > 50000) {
      alertas.push({
        tipo: 'danger',
        mensaje: `Gasto promedio alto: $${gastoPromedio.toLocaleString()}. Revisar eficiencia.`
      });
    }
    
    // Alert por rentabilidad
    const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.total), 0);
    const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.total), 0);
    const rentabilidad = totalIngresos > 0 ? ((totalIngresos - totalGastos) / totalIngresos) * 100 : 0;
    
    if (rentabilidad < 20) {
      alertas.push({
        tipo: 'danger',
        mensaje: `Rentabilidad baja: ${Math.round(rentabilidad)}%. Requiere atención inmediata.`
      });
    } else if (rentabilidad > 60) {
      alertas.push({
        tipo: 'success',
        mensaje: `Excelente rentabilidad: ${Math.round(rentabilidad)}%. Mantener estrategia actual.`
      });
    }
    
    return alertas;
  };

  // ✅ OBTENER DATOS PARA GRÁFICO DE RENDIMIENTO
  const getDatosGraficoRendimiento = () => {
    if (!state.reportesCamiones) return [];
    
    return state.reportesCamiones.slice(0, 10).map(camion => ({
      patente: camion.patente,
      ingresos: camion.ingresos,
      gastos: camion.gastos,
      ganancia: camion.ganancia,
      viajes: camion.viajes_mes,
      rentabilidad: camion.rentabilidad
    }));
  };

  // ✅ OBTENER DATOS PARA GRÁFICO DE DISTRIBUCIÓN
  const getDatosGraficoDistribucion = () => {
    if (!state.comparativo?.distribución) return [];
    
    const dist = state.comparativo.distribución;
    return [
      { name: 'Excelente', value: dist.excelente, color: '#10B981' },
      { name: 'Muy Bueno', value: dist.muyBueno, color: '#3B82F6' },
      { name: 'Bueno', value: dist.bueno, color: '#F59E0B' },
      { name: 'Regular', value: dist.regular, color: '#F97316' },
      { name: 'Malo', value: dist.malo, color: '#EF4444' }
    ].filter(item => item.value > 0);
  };

  // ✅ OBTENER DATOS PARA GRÁFICO DE COMPARACIÓN
  const getDatosGraficoComparacion = (metrica = 'ganancia') => {
    if (!state.reportesCamiones) return [];
    
    return state.reportesCamiones.map(camion => ({
      patente: camion.patente,
      valor: camion[metrica],
      promedio: state.comparativo?.[`promedio${metrica.charAt(0).toUpperCase() + metrica.slice(1)}`] || 0,
      clasificacion: camion.clasificacion
    }));
  };

  // ✅ EXPORTAR DATOS PARA CSV/EXCEL
  const exportarDatos = (formato = 'csv') => {
    if (!state.reportesCamiones) return null;
    
    const datos = state.reportesCamiones.map(camion => ({
      'Patente': camion.patente,
      'Marca': camion.marca,
      'Modelo': camion.modelo,
      'Viajes': camion.viajes_mes,
      'Km Recorridos': camion.km_recorridos,
      'Ingresos': camion.ingresos,
      'Gastos': camion.gastos,
      'Ganancia': camion.ganancia,
      'Rentabilidad %': camion.rentabilidad,
      'Clasificación': camion.clasificacion,
      'Estado': camion.estado
    }));
    
    if (formato === 'csv') {
      return convertirACSV(datos);
    }
    
    return datos;
  };

  // ✅ CONVERTIR A CSV
  const convertirACSV = (datos) => {
    if (!datos.length) return '';
    
    const headers = Object.keys(datos[0]);
    const csvContent = [
      headers.join(','),
      ...datos.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };

  // ✅ COMPARAR CAMIÓN CON PROMEDIO
  const compararConPromedio = (camionId) => {
    const camion = state.reportesCamiones?.find(c => c.id === camionId);
    if (!camion || !state.comparativo) return null;
    
    return {
      camion: camion.patente,
      comparaciones: {
        ingresos: {
          valor: camion.ingresos,
          promedio: state.comparativo.promedioIngresos,
          diferencia: camion.ingresos - state.comparativo.promedioIngresos,
          porcentaje: state.comparativo.promedioIngresos > 0 ? 
            Math.round(((camion.ingresos - state.comparativo.promedioIngresos) / state.comparativo.promedioIngresos) * 100) : 0
        },
        gastos: {
          valor: camion.gastos,
          promedio: state.comparativo.promedioGastos,
          diferencia: camion.gastos - state.comparativo.promedioGastos,
          porcentaje: state.comparativo.promedioGastos > 0 ? 
            Math.round(((camion.gastos - state.comparativo.promedioGastos) / state.comparativo.promedioGastos) * 100) : 0
        },
        ganancia: {
          valor: camion.ganancia,
          promedio: state.comparativo.promedioGanancia,
          diferencia: camion.ganancia - state.comparativo.promedioGanancia,
          porcentaje: state.comparativo.promedioGanancia > 0 ? 
            Math.round(((camion.ganancia - state.comparativo.promedioGanancia) / state.comparativo.promedioGanancia) * 100) : 0
        }
      }
    };
  };

  // ✅ RECARGAR Y LIMPIAR
  const refresh = async (año = null, mes = null) => {
    console.log('🔄 Recargando reporte por camiones...');
    return await getReportePorCamiones(año, mes);
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const clearDetalle = () => {
    setState(prev => ({ 
      ...prev, 
      camionSeleccionado: null, 
      detalleCamion: null 
    }));
  };

  // ✅ CARGAR AUTOMÁTICAMENTE AL MONTAR
  useEffect(() => {
    if (autoLoad) {
      console.log('🚀 Cargando reporte por camiones automáticamente...');
      getReportePorCamiones();
    }
  }, [autoLoad]);

  return {
    // Estado
    ...state,
    
    // Acciones principales
    getReportePorCamiones,
    getDetalleCamion,
    refresh,
    clearError,
    clearDetalle,
    
    // Datos procesados para gráficos
    getDatosGraficoRendimiento,
    getDatosGraficoDistribucion,
    getDatosGraficoComparacion,
    
    // Análisis y comparaciones
    compararConPromedio,
    exportarDatos,
    
    // Estado calculado
    hayDatos: !!(state.reportesCamiones?.length > 0),
    totalCamiones: state.reportesCamiones?.length || 0,
    
    // Accesos rápidos a rankings
    mejorCamion: state.rankings?.porGanancia?.[0],
    peorCamion: state.rankings?.porGanancia?.[state.rankings.porGanancia.length - 1],
    masViajero: state.rankings?.porViajes?.[0],
    masRentable: state.rankings?.porRentabilidad?.[0],
    
    // Métricas generales
    totalFlota: {
      ingresos: state.reportesCamiones?.reduce((sum, c) => sum + c.ingresos, 0) || 0,
      gastos: state.reportesCamiones?.reduce((sum, c) => sum + c.gastos, 0) || 0,
      viajes: state.reportesCamiones?.reduce((sum, c) => sum + c.viajes_mes, 0) || 0,
      kilometros: state.reportesCamiones?.reduce((sum, c) => sum + c.km_recorridos, 0) || 0
    }
  };
};