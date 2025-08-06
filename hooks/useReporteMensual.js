// hooks/useReporteMensual.js - SISTEMA DE FLETES
import { useState, useEffect } from 'react';
import { axiosAuth } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

export const useReporteMensual = (autoLoad = true) => {
  const [state, setState] = useState({
    reporteMensual: null,
    mesesComparativos: [],
    tendencias: null,
    loading: false,
    error: null,
    metadatos: {
      añoActual: new Date().getFullYear(),
      mesActual: new Date().getMonth() + 1,
      últimaActualización: null
    }
  });

  // ✅ OBTENER REPORTE MENSUAL COMPLETO
  const getReporteMensual = async (año = null, limiteMeses = 12) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const añoConsulta = año || new Date().getFullYear();
      
      console.log(`📊 Obteniendo reporte mensual para ${añoConsulta}...`);
      const response = await axiosAuth.get(`/reportes/mensual?año=${añoConsulta}`);
      
      // Procesar datos para gráficos y análisis
      const datosProcessados = procesarDatosMensuales(response.data);
      
      setState(prev => ({ 
        ...prev, 
        reporteMensual: response.data,
        mesesComparativos: datosProcessados.mesesComparativos,
        tendencias: datosProcessados.tendencias,
        metadatos: {
          ...prev.metadatos,
          añoActual: añoConsulta,
          últimaActualización: new Date().toISOString()
        },
        loading: false 
      }));
      
      console.log('✅ Reporte mensual obtenido:', response.data.meses?.length, 'meses');
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Error obteniendo reporte mensual:', error);
      const errorMessage = error.response?.data?.message || 'Error obteniendo reporte mensual';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ✅ PROCESAR DATOS PARA VISUALIZACIÓN
  const procesarDatosMensuales = (datosReporte) => {
    if (!datosReporte?.meses) return { mesesComparativos: [], tendencias: null };

    const meses = datosReporte.meses;
    
    // Preparar datos para gráficos
    const mesesComparativos = meses.map(mes => ({
      ...mes,
      // Formatear nombres de mes para gráficos
      mesCorto: obtenerNombreMesCorto(mes.mes),
      // Calcular ratios y porcentajes
      margenPorcentaje: mes.ingresos > 0 ? Math.round((mes.balance / mes.ingresos) * 100) : 0,
      crecimientoIngresos: 0, // Se calculará después
      eficiencia: mes.gastos > 0 ? Math.round((mes.ingresos / mes.gastos) * 100) : 0
    }));

    // Calcular tendencias y crecimiento
    const tendencias = calcularTendencias(mesesComparativos);
    
    // Añadir crecimiento mes a mes
    mesesComparativos.forEach((mes, index) => {
      if (index > 0) {
        const mesAnterior = mesesComparativos[index - 1];
        mes.crecimientoIngresos = mesAnterior.ingresos > 0 
          ? Math.round(((mes.ingresos - mesAnterior.ingresos) / mesAnterior.ingresos) * 100)
          : 0;
      }
    });

    return { mesesComparativos, tendencias };
  };

  // ✅ CALCULAR TENDENCIAS Y MÉTRICAS AVANZADAS
  const calcularTendencias = (mesesData) => {
    if (!mesesData || mesesData.length < 2) return null;

    const ingresos = mesesData.map(m => m.ingresos);
    const gastos = mesesData.map(m => m.gastos);
    const balances = mesesData.map(m => m.balance);

    return {
      // Promedios
      promedioIngresosMensual: Math.round(ingresos.reduce((a, b) => a + b, 0) / ingresos.length),
      promedioGastosMensual: Math.round(gastos.reduce((a, b) => a + b, 0) / gastos.length),
      promedioBalanceMensual: Math.round(balances.reduce((a, b) => a + b, 0) / balances.length),
      
      // Mejor y peor mes
      mejorMes: mesesData.reduce((prev, current) => 
        current.balance > prev.balance ? current : prev
      ),
      peorMes: mesesData.reduce((prev, current) => 
        current.balance < prev.balance ? current : prev
      ),
      
      // Tendencias (últimos 3 meses vs anteriores)
      tendenciaIngresos: calcularTendencia(ingresos),
      tendenciaGastos: calcularTendencia(gastos),
      tendenciaBalance: calcularTendencia(balances),
      
      // Estacionalidad
      mesConMasViajes: mesesData.reduce((prev, current) => 
        current.viajes > prev.viajes ? current : prev
      ),
      
      // Eficiencia operativa
      eficienciaPromedio: Math.round(
        mesesData.reduce((sum, mes) => sum + mes.eficiencia, 0) / mesesData.length
      )
    };
  };

  // ✅ CALCULAR TENDENCIA SIMPLE (ASCENDENTE, DESCENDENTE, ESTABLE)
  const calcularTendencia = (valores) => {
    if (valores.length < 3) return 'INSUFICIENTE';
    
    const mitad = Math.floor(valores.length / 2);
    const primera_mitad = valores.slice(0, mitad);
    const segunda_mitad = valores.slice(mitad);
    
    const promedio1 = primera_mitad.reduce((a, b) => a + b, 0) / primera_mitad.length;
    const promedio2 = segunda_mitad.reduce((a, b) => a + b, 0) / segunda_mitad.length;
    
    const diferencia = ((promedio2 - promedio1) / promedio1) * 100;
    
    if (diferencia > 10) return 'ASCENDENTE';
    if (diferencia < -10) return 'DESCENDENTE';
    return 'ESTABLE';
  };

  // ✅ OBTENER DATOS PARA GRÁFICO DE LÍNEAS
  const getDatosGraficoLineas = () => {
    if (!state.mesesComparativos) return [];
    
    return state.mesesComparativos.map(mes => ({
      mes: mes.mesCorto,
      ingresos: mes.ingresos,
      gastos: mes.gastos,
      balance: mes.balance,
      viajes: mes.viajes
    }));
  };

  // ✅ OBTENER DATOS PARA GRÁFICO DE BARRAS COMPARATIVO
  const getDatosGraficoBarras = () => {
    if (!state.mesesComparativos) return [];
    
    return state.mesesComparativos.slice(-6).map(mes => ({
      mes: mes.mesCorto,
      ingresos: mes.ingresos,
      gastos: mes.gastos,
      margen: mes.margenPorcentaje
    }));
  };

  // ✅ OBTENER DATOS PARA GRÁFICO CIRCULAR (DISTRIBUCIÓN ANUAL)
  const getDatosGraficoCircular = () => {
    if (!state.reporteMensual?.resumen) return [];
    
    const resumen = state.reporteMensual.resumen;
    const total = resumen.total_ingresos_periodo + resumen.total_gastos_periodo;
    
    return [
      {
        name: 'Ingresos',
        value: resumen.total_ingresos_periodo,
        porcentaje: Math.round((resumen.total_ingresos_periodo / total) * 100),
        color: '#10B981'
      },
      {
        name: 'Gastos',
        value: resumen.total_gastos_periodo,
        porcentaje: Math.round((resumen.total_gastos_periodo / total) * 100),
        color: '#EF4444'
      }
    ];
  };

  // ✅ GENERAR RECOMENDACIONES BASADAS EN DATOS
  const getRecomendaciones = () => {
    if (!state.tendencias) return [];
    
    const recomendaciones = [];
    const { tendencias, reporteMensual } = state;
    
    // Recomendaciones basadas en tendencias
    if (tendencias.tendenciaIngresos === 'DESCENDENTE') {
      recomendaciones.push({
        tipo: 'warning',
        titulo: 'Ingresos en declive',
        mensaje: 'Los ingresos han disminuido en los últimos meses. Considera revisar precios o buscar nuevos clientes.',
        accion: 'Revisar estrategia comercial'
      });
    }
    
    if (tendencias.tendenciaGastos === 'ASCENDENTE') {
      recomendaciones.push({
        tipo: 'danger',
        titulo: 'Gastos en aumento',
        mensaje: 'Los gastos operativos están creciendo. Revisa mantenimientos y combustible.',
        accion: 'Auditar gastos principales'
      });
    }
    
    if (tendencias.eficienciaPromedio > 150) {
      recomendaciones.push({
        tipo: 'success',
        titulo: 'Excelente eficiencia',
        mensaje: `Eficiencia operativa del ${tendencias.eficienciaPromedio}%. ¡Mantén este nivel!`,
        accion: 'Documentar mejores prácticas'
      });
    }
    
    // Recomendaciones estacionales
    if (reporteMensual?.meses) {
      const mesesBajos = reporteMensual.meses.filter(m => m.viajes < tendencias.mesConMasViajes.viajes * 0.7);
      if (mesesBajos.length > 0) {
        recomendaciones.push({
          tipo: 'info',
          titulo: 'Oportunidad estacional',
          mensaje: `Los meses ${mesesBajos.map(m => obtenerNombreMesCorto(m.mes)).join(', ')} tienen menos viajes.`,
          accion: 'Planificar campañas específicas'
        });
      }
    }
    
    return recomendaciones;
  };

  // ✅ UTILIDADES
  const obtenerNombreMesCorto = (numeroMes) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                   'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return meses[numeroMes - 1] || 'N/A';
  };

  const obtenerNombreMesCompleto = (numeroMes) => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[numeroMes - 1] || 'N/A';
  };

  // ✅ RECARGAR Y LIMPIAR
  const refresh = async (año = null) => {
    console.log('🔄 Recargando reporte mensual...');
    return await getReporteMensual(año);
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // ✅ CARGAR AUTOMÁTICAMENTE AL MONTAR
  useEffect(() => {
    if (autoLoad) {
      console.log('🚀 Cargando reporte mensual automáticamente...');
      getReporteMensual();
    }
  }, [autoLoad]);

  return {
    // Estado
    ...state,
    
    // Acciones principales
    getReporteMensual,
    refresh,
    clearError,
    
    // Datos procesados para gráficos
    getDatosGraficoLineas,
    getDatosGraficoBarras,
    getDatosGraficoCircular,
    
    // Análisis y recomendaciones
    getRecomendaciones,
    
    // Utilidades
    obtenerNombreMesCorto,
    obtenerNombreMesCompleto,
    
    // Estado calculado
    hayDatos: !!(state.reporteMensual?.meses?.length > 0),
    totalMeses: state.mesesComparativos?.length || 0,
    añoConsultado: state.metadatos.añoActual,
    
    // Métricas rápidas
    ingresosTotales: state.reporteMensual?.resumen?.total_ingresos_periodo || 0,
    gastosTotales: state.reporteMensual?.resumen?.total_gastos_periodo || 0,
    balanceAnual: (state.reporteMensual?.resumen?.total_ingresos_periodo || 0) - 
                  (state.reporteMensual?.resumen?.total_gastos_periodo || 0),
    promedioViajesMensual: state.reporteMensual?.resumen?.promedio_viajes || 0
  };
};