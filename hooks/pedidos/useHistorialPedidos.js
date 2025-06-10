import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export function useHistorialPedidos(filtroEmpleado = null) {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedidos, setSelectedPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    cliente: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    cargarPedidos();
  }, [filtroEmpleado]); // Recargar cuando cambie el filtro de empleado

  // Cargar pedidos según el rol del usuario
  const cargarPedidos = async () => {
    setLoading(true);
    try {
      let url = `${apiUrl}/pedidos/obtener-pedidos`;
      
      // Si se especifica un filtro de empleado (para vendedores), agregarlo a la URL
      if (filtroEmpleado) {
        url += `?empleado_id=${filtroEmpleado}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setPedidos(response.data.data);
        console.log(`📋 Cargados ${response.data.data.length} pedidos para ${filtroEmpleado ? 'vendedor' : 'todos'}`);
      } else {
        toast.error(response.data.message || 'Error al cargar pedidos');
        setPedidos([]);
      }
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      toast.error("No se pudieron cargar los pedidos");
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar/deseleccionar un pedido individual
  const handleSelectPedido = (pedidoId) => {
    if (selectedPedidos.includes(pedidoId)) {
      setSelectedPedidos(selectedPedidos.filter(id => id !== pedidoId));
    } else {
      setSelectedPedidos([...selectedPedidos, pedidoId]);
    }
  };

  // Seleccionar/deseleccionar todos los pedidos visibles
  const handleSelectAllPedidos = (pedidosVisibles) => {
    const todosSeleccionados = pedidosVisibles.every(p => selectedPedidos.includes(p.id));
    
    if (todosSeleccionados) {
      // Deseleccionar todos los visibles
      setSelectedPedidos(selectedPedidos.filter(id => !pedidosVisibles.some(p => p.id === id)));
    } else {
      // Seleccionar todos los visibles que no estén ya seleccionados
      const nuevosIds = pedidosVisibles.map(p => p.id).filter(id => !selectedPedidos.includes(id));
      setSelectedPedidos([...selectedPedidos, ...nuevosIds]);
    }
  };

  // Limpiar selección
  const clearSelection = () => {
    setSelectedPedidos([]);
  };

  // Filtrar pedidos por estado
  const filtrarPorEstado = (estado) => {
    if (!estado) return pedidos;
    return pedidos.filter(pedido => pedido.estado === estado);
  };

  // Filtrar pedidos por cliente
  const filtrarPorCliente = (nombreCliente) => {
    if (!nombreCliente) return pedidos;
    return pedidos.filter(pedido => 
      pedido.cliente_nombre.toLowerCase().includes(nombreCliente.toLowerCase())
    );
  };

  // Filtrar pedidos por rango de fechas
  const filtrarPorFecha = (fechaDesde, fechaHasta) => {
    if (!fechaDesde && !fechaHasta) return pedidos;
    
    return pedidos.filter(pedido => {
      const fechaPedido = new Date(pedido.fecha);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;
      
      if (desde && hasta) {
        return fechaPedido >= desde && fechaPedido <= hasta;
      } else if (desde) {
        return fechaPedido >= desde;
      } else if (hasta) {
        return fechaPedido <= hasta;
      }
      return true;
    });
  };

  // Aplicar todos los filtros
  const aplicarFiltros = (pedidosBase = pedidos) => {
    let pedidosFiltrados = pedidosBase;

    if (filtros.estado) {
      pedidosFiltrados = filtrarPorEstado(filtros.estado);
    }
    
    if (filtros.cliente) {
      pedidosFiltrados = filtrarPorCliente(filtros.cliente);
    }
    
    if (filtros.fechaDesde || filtros.fechaHasta) {
      pedidosFiltrados = filtrarPorFecha(filtros.fechaDesde, filtros.fechaHasta);
    }

    return pedidosFiltrados;
  };

  // Actualizar filtros
  const actualizarFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      cliente: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  // Cambiar estado de múltiples pedidos
  const cambiarEstadoMultiple = async (nuevoEstado) => {
    if (selectedPedidos.length === 0) {
      toast.error('No hay pedidos seleccionados');
      return false;
    }

    setLoading(true);
    let exitosos = 0;
    let fallidos = 0;

    try {
      for (const pedidoId of selectedPedidos) {
        try {
          const response = await axios.put(`${apiUrl}/pedidos/actualizar-estado/${pedidoId}`, {
            estado: nuevoEstado
          });
          
          if (response.data.success) {
            exitosos++;
          } else {
            fallidos++;
          }
        } catch (error) {
          console.error(`Error actualizando pedido ${pedidoId}:`, error);
          fallidos++;
        }
      }

      if (exitosos > 0) {
        toast.success(`${exitosos} pedidos actualizados a "${nuevoEstado}"`);
        await cargarPedidos(); // Recargar lista
        clearSelection(); // Limpiar selección
      }
      
      if (fallidos > 0) {
        toast.error(`${fallidos} pedidos no se pudieron actualizar`);
      }

      return exitosos > 0;
    } catch (error) {
      console.error('Error en cambio masivo de estado:', error);
      toast.error('Error al cambiar estado de pedidos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar múltiples pedidos
  const eliminarMultiple = async () => {
    if (selectedPedidos.length === 0) {
      toast.error('No hay pedidos seleccionados');
      return false;
    }

    setLoading(true);
    let exitosos = 0;
    let fallidos = 0;

    try {
      for (const pedidoId of selectedPedidos) {
        try {
          const response = await axios.delete(`${apiUrl}/pedidos/eliminar-pedido/${pedidoId}`);
          
          if (response.data.success) {
            exitosos++;
          } else {
            fallidos++;
          }
        } catch (error) {
          console.error(`Error eliminando pedido ${pedidoId}:`, error);
          fallidos++;
        }
      }

      if (exitosos > 0) {
        toast.success(`${exitosos} pedidos eliminados`);
        await cargarPedidos(); // Recargar lista
        clearSelection(); // Limpiar selección
      }
      
      if (fallidos > 0) {
        toast.error(`${fallidos} pedidos no se pudieron eliminar`);
      }

      return exitosos > 0;
    } catch (error) {
      console.error('Error en eliminación múltiple:', error);
      toast.error('Error al eliminar pedidos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas rápidas
  const getEstadisticas = () => {
    const total = pedidos.length;
    const exportados = pedidos.filter(p => p.estado === 'Exportado').length;
    const facturados = pedidos.filter(p => p.estado === 'Facturado').length;
    const anulados = pedidos.filter(p => p.estado === 'Anulado').length;
    const totalMonto = pedidos.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);

    return {
      total,
      exportados,
      facturados,
      anulados,
      totalMonto: parseFloat(totalMonto.toFixed(2)),
      seleccionados: selectedPedidos.length
    };
  };

  return {
    // Estado principal
    pedidos,
    selectedPedidos,
    loading,
    filtros,
    
    // Funciones de carga
    cargarPedidos,
    
    // Funciones de selección
    handleSelectPedido,
    handleSelectAllPedidos,
    clearSelection,
    
    // Funciones de filtrado
    aplicarFiltros,
    actualizarFiltro,
    limpiarFiltros,
    filtrarPorEstado,
    filtrarPorCliente,
    filtrarPorFecha,
    
    // Operaciones múltiples
    cambiarEstadoMultiple,
    eliminarMultiple,
    
    // Utilidades
    getEstadisticas
  };
}