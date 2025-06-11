import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Hooks personalizados
import { useHistorialPedidos } from '../../hooks/pedidos/useHistorialPedidos';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useEditarPedido } from '../../hooks/pedidos/useEditarPedido';
import { useGenerarPDFPedido } from 'hooks/pedidos/useGenerarPdfPedido'; // HOOK ACTUALIZADO
import { useAnularPedido } from '../../hooks/pedidos/useAnularPedido';

// Componentes
import TablaPedidos from '../../components/pedidos/TablaPedidos';
import { Paginacion } from '../../components/Paginacion';
import { 
  ModalDetallePedido, 
  ModalEditarProductoPedido, 
  ModalEliminarProductoPedido, 
  ModalAgregarProductoPedido 
} from '../../components/pedidos/ModalesHistorialPedidos';
import { 
  ModalConfirmacionSalidaPedidos,
  ModalConfirmacionAnularPedidoIndividual
} from '../../components/pedidos/ModalesConfirmacion';
import { BotonAccionesPedidos } from '../../components/pedidos/BotonAccionesPedidos'; // COMPONENTE ACTUALIZADO
import { axiosAuth } from '../../utils/apiClient';

function HistorialPedidosContent() {
  // Estados para modales existentes (SIN CAMBIOS)
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalAgregarProducto, setMostrarModalAgregarProducto] = useState(false);
  const [mostrarModalEditarProducto, setMostrarModalEditarProducto] = useState(false);
  const [mostrarModalEliminarProducto, setMostrarModalEliminarProducto] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  const [mostrarModalFacturacion, setMostrarModalFacturacion] = useState(false);

  // Estados para anulación individual (SIN CAMBIOS)
  const [mostrarModalAnularPedido, setMostrarModalAnularPedido] = useState(false);
  const [pedidoParaAnular, setPedidoParaAnular] = useState(null);

  // Estados para productos en edición (SIN CAMBIOS)
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoEliminando, setProductoEliminando] = useState(null);

  // Hook de autenticación (SIN CAMBIOS)
  const { user, loading: authLoading } = useAuth();

  // Hook para anular pedidos (SIN CAMBIOS)
  const { loading: loadingAnular, anularPedido } = useAnularPedido();

  // HOOK ACTUALIZADO para generar PDFs
  const {
    generandoPDF,
    generandoPDFMultiple, // NUEVO ESTADO
    generarPDFPedido,
    generarPDFsPedidosMultiples // NUEVA FUNCIÓN
  } = useGenerarPDFPedido();

  // Determinar si debe filtrar por empleado (SIN CAMBIOS)
  const filtroEmpleado = user && user.rol !== 'GERENTE' ? user.id : null;

  // Hooks personalizados (SIN CAMBIOS)
  const { 
    pedidos, 
    selectedPedidos, 
    loading, 
    handleSelectPedido, 
    handleSelectAllPedidos, 
    clearSelection,
    cambiarEstadoMultiple,
    eliminarMultiple,
    cargarPedidos 
  } = useHistorialPedidos(filtroEmpleado);

  // Effect para cargar pedidos (SIN CAMBIOS)
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Usuario cargado, forzando recarga de pedidos:', {
        usuario: user.nombre,
        rol: user.rol,
        filtroCalculado: user.rol !== 'GERENTE' ? user.id : null
      });
      
      setTimeout(() => {
        cargarPedidos();
      }, 100);
    }
  }, [user, authLoading]);
  
  // Hook de paginación (SIN CAMBIOS)
  const {
    datosActuales: pedidosActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  } = usePaginacion(pedidos, 10);

  // Hook para editar pedidos (SIN CAMBIOS)
  const {
    selectedPedido,
    productos,
    loading: loadingProductos,
    cargarProductosPedido,
    agregarProducto,
    eliminarProducto,
    actualizarProducto,
    cerrarEdicion
  } = useEditarPedido();

  // FUNCIONES para anular pedidos (SIN CAMBIOS)
  const handleMostrarConfirmacionAnular = (pedido, productosDelPedido) => {
    setPedidoParaAnular({
      ...pedido,
      productos: productosDelPedido || productos
    });
    setMostrarModalAnularPedido(true);
  };

  const handleAnularPedidoIndividual = async () => {
    if (!pedidoParaAnular) {
      toast.error('No hay pedido para anular');
      return;
    }

    const resultado = await anularPedido(pedidoParaAnular.id);
    
    if (resultado.success) {
      setMostrarModalAnularPedido(false);
      setMostrarModalDetalle(false);
      setPedidoParaAnular(null);
      cerrarEdicion();
      await cargarPedidos();
    }
  };

  // FUNCIÓN para cambiar estado de pedido (SIN CAMBIOS)
  const handleCambiarEstadoPedido = async (nuevoEstado) => {
    if (!selectedPedido) {
      toast.error("No hay pedido seleccionado");
      return;
    }

    if (nuevoEstado === 'Anulado') {
      handleMostrarConfirmacionAnular(selectedPedido, productos);
      return;
    }

    try {
      const response = await axiosAuth.put(`/pedidos/actualizar-estado/${selectedPedido.id}`, {
        estado: nuevoEstado
      });

      if (response.data.success) {
        toast.success(`Pedido #${selectedPedido.id} marcado como ${nuevoEstado}`);
        setMostrarModalDetalle(false);
        cerrarEdicion();
        await cargarPedidos();
      } else {
        toast.error(response.data.message || 'Error al cambiar estado del pedido');
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado del pedido');
    }
  };

  // Handlers para eventos de la tabla (SIN CAMBIOS)
  const handleRowDoubleClick = async (pedido) => {
    try {
      await cargarProductosPedido(pedido);
      setMostrarModalDetalle(true);
    } catch (error) {
      toast.error('Error al cargar detalles del pedido');
    }
  };

  const handleCloseModalDetalle = () => {
    setMostrarModalDetalle(false);
    cerrarEdicion();
  };

  // Handlers para productos (SIN CAMBIOS)
  const handleAgregarProducto = () => {
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalAgregarProducto(true), 300);
  };

  const handleEditarProducto = (producto) => {
    setProductoEditando({ ...producto });
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalEditarProducto(true), 300);
  };

  const handleEliminarProducto = (producto) => {
    setProductoEliminando(producto);
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalEliminarProducto(true), 300);
  };

  // Handlers para modales de productos (SIN CAMBIOS)
  const handleCloseModalAgregarProducto = () => {
    setMostrarModalAgregarProducto(false);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  const handleCloseModalEditarProducto = () => {
    setMostrarModalEditarProducto(false);
    setProductoEditando(null);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  const handleCloseModalEliminarProducto = () => {
    setMostrarModalEliminarProducto(false);
    setProductoEliminando(null);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  // Handlers para acciones de productos (SIN CAMBIOS)
  const handleConfirmarAgregarProducto = async (producto, cantidad) => {
    const exito = await agregarProducto(producto, cantidad);
    if (exito) {
      handleCloseModalAgregarProducto();
    }
    return exito;
  };

  const handleConfirmarEditarProducto = async () => {
    if (!productoEditando) return;
    
    const exito = await actualizarProducto(productoEditando);
    if (exito) {
      handleCloseModalEditarProducto();
    }
  };

  const handleConfirmarEliminarProducto = async () => {
    if (!productoEliminando) return;
    
    const exito = await eliminarProducto(productoEliminando);
    if (exito) {
      handleCloseModalEliminarProducto();
    }
  };

  // FUNCIÓN ACTUALIZADA para generar PDF individual
  const handleGenerarPDF = async () => {
    if (!selectedPedido || productos.length === 0) {
      toast.error("Seleccione un pedido con productos");
      return;
    }
     
    await generarPDFPedido(selectedPedido, productos);
  };

  // NUEVA FUNCIÓN para generar PDFs múltiples
  const handleImprimirMultiple = async () => {
    if (selectedPedidos.length === 0) {
      toast.error('Seleccione al menos un pedido para imprimir');
      return;
    }

    console.log('🖨️ Iniciando impresión múltiple de pedidos:', selectedPedidos);
    
    const exito = await generarPDFsPedidosMultiples(selectedPedidos);
    
    if (exito) {
      // Limpiar selección después de la impresión exitosa
      clearSelection();
      toast.success('PDFs generados correctamente');
    }
  };

  // Handlers para navegación (SIN CAMBIOS)
  const handleConfirmarSalida = () => {
    setMostrarConfirmacionSalida(true);
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  // FUNCIONES COMENTADAS - Ya no se usan con el nuevo diseño
  /*
  const handleCambiarEstadoMultiple = async (nuevoEstado) => {
    if (selectedPedidos.length === 0) {
      toast.error('Seleccione al menos un pedido');
      return;
    }
    
    const exito = await cambiarEstadoMultiple(nuevoEstado);
    if (exito) {
      clearSelection();
    }
  };

  const handleEliminarMultiple = async () => {
    if (selectedPedidos.length === 0) {
      toast.error('Seleccione al menos un pedido para eliminar');
      return;
    }

    if (window.confirm(`¿Está seguro de eliminar ${selectedPedidos.length} pedidos? Esta acción no se puede deshacer.`)) {
      const exito = await eliminarMultiple();
      if (exito) {
        clearSelection();
      }
    }
  };

  const handleExportarPedidos = async () => {
    if (selectedPedidos.length === 0) {
      toast.error('Seleccione al menos un pedido para exportar');
      return;
    }
    
    toast.info('Generando exportación de pedidos...');
    console.log('Pedidos seleccionados para exportar:', selectedPedidos);
  };
  */

  // Mostrar loading mientras se autentica (SIN CAMBIOS)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Función para obtener el título dinámico (SIN CAMBIOS)
  const getTitulo = () => {
    if (user?.rol === 'GERENTE') {
      return 'HISTORIAL DE PEDIDOS - TODOS LOS PEDIDOS';
    }
    return `HISTORIAL DE PEDIDOS - ${user?.nombre?.toUpperCase() || 'MIS PEDIDOS'}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE PEDIDOS</title>
        <meta name="description" content="Historial de pedidos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {getTitulo()}
        </h1>
        
        <TablaPedidos
          pedidos={pedidosActuales}
          selectedPedidos={selectedPedidos}
          onSelectPedido={handleSelectPedido}
          onSelectAll={() => handleSelectAllPedidos(pedidosActuales)}
          onRowDoubleClick={handleRowDoubleClick}
          loading={loading}
          mostrarPermisos={true}
          isPedidoFacturado={selectedPedido?.estado === 'Facturado'}
        />
        
        <Paginacion
          datosOriginales={pedidos}
          paginaActual={paginaActual}
          registrosPorPagina={registrosPorPagina}
          totalPaginas={totalPaginas}
          indexOfPrimero={indexOfPrimero}
          indexOfUltimo={indexOfUltimo}
          onCambiarPagina={cambiarPagina}
          onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
        />
        
        {/* COMPONENTE ACTUALIZADO - Ahora solo pasa onImprimirMultiple */}
        <BotonAccionesPedidos
          contexto="historial"
          selectedPedidos={selectedPedidos}
          onImprimirMultiple={handleImprimirMultiple} // NUEVA PROP
          onVolverMenu={handleConfirmarSalida}
          loading={generandoPDFMultiple || loading} // ESTADO ACTUALIZADO
          mostrarEstadisticas={false}
        />
      </div>
      
      {/* MODALES (SIN CAMBIOS) */}
      <ModalDetallePedido
        pedido={selectedPedido}
        productos={productos}
        loading={loadingProductos}
        onClose={handleCloseModalDetalle}
        onAgregarProducto={handleAgregarProducto}
        onEditarProducto={handleEditarProducto}
        onEliminarProducto={handleEliminarProducto}
        onCambiarEstado={handleCambiarEstadoPedido}
        onGenerarPDF={handleGenerarPDF}
        generandoPDF={generandoPDF}
        mostrarModalFacturacion={mostrarModalFacturacion}
        setMostrarModalFacturacion={setMostrarModalFacturacion}
        isPedidoFacturado={selectedPedido?.estado === 'Facturado'}
        isPedidoAnulado={selectedPedido?.estado === 'Anulado'}
      />

      <ModalAgregarProductoPedido
        mostrar={mostrarModalAgregarProducto}
        onClose={handleCloseModalAgregarProducto}
        onAgregarProducto={handleConfirmarAgregarProducto}
      />

      <ModalEditarProductoPedido
        producto={productoEditando}
        onClose={handleCloseModalEditarProducto}
        onGuardar={handleConfirmarEditarProducto}
        onChange={setProductoEditando}
      />

      <ModalEliminarProductoPedido
        producto={productoEliminando}
        onClose={handleCloseModalEliminarProducto}
        onConfirmar={handleConfirmarEliminarProducto}
      />

      <ModalConfirmacionSalidaPedidos
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />

      <ModalConfirmacionAnularPedidoIndividual
        mostrar={mostrarModalAnularPedido}
        pedido={pedidoParaAnular}
        productos={productos}
        onConfirmar={handleAnularPedidoIndividual}
        onCancelar={() => {
          setMostrarModalAnularPedido(false);
          setPedidoParaAnular(null);
        }}
        loading={loadingAnular}
      />
    </div>
  );
}

export default function HistorialPedidos() {
  return <HistorialPedidosContent />;
}