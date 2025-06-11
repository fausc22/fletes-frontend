import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Hooks personalizados
import { useHistorialVentas } from '../../hooks/ventas/useHistorialVentas';
import { useFiltrosVentas } from '../../hooks/ventas/useFiltrosVentas';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useEditarVenta } from '../../hooks/ventas/useEditarVenta';
import { useComprobantes } from '../../hooks/ventas/useComprobantes';
import { useGenerarPDFsVentas } from '../../hooks/ventas/useGenerarPDFsVentas';

// Componentes
import FiltrosHistorialVentas from '../../components/ventas/FiltrosHistorialVentas';
import TablaVentas from '../../components/ventas/TablaVentas';
import { Paginacion } from '../../components/Paginacion';
import { ModalDetalleVenta } from '../../components/ventas/ModalesHistorialVentas';
import { ModalComprobantesVenta } from '../../components/ventas/ModalComprobantesVenta';
import { ModalConfirmacionSalida } from '../../components/ventas/ModalesConfirmacion';
import { BotonAcciones } from '../../components/ventas/BotonAcciones';

function HistorialVentasContent() {
  // Estados para modales
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalComprobante, setMostrarModalComprobante] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  const { user } = useAuth();

  // Hooks personalizados
  const { ventas, selectedVentas, loading, handleSelectVenta, handleSelectAllVentas, clearSelection } = useHistorialVentas();
  
  // 🆕 Hook de filtros para ventas
  const { filtros, ventasFiltradas, handleFiltrosChange, limpiarFiltros } = useFiltrosVentas(ventas);
  
  const {
    datosActuales: ventasActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  } = usePaginacion(ventasFiltradas, 10); // 🔄 Usar ventasFiltradas en lugar de ventas

  const {
    selectedVenta,
    productos,
    cuenta,
    loading: loadingProductos,
    cargarProductosVenta,
    cargarCuenta,
    cerrarEdicion
  } = useEditarVenta();

  const {
    comprobante,
    comprobantePreview,
    comprobanteExistente,
    uploadingComprobante,
    verificarComprobanteExistente,
    handleFileChange,
    uploadComprobante,
    viewComprobante,
    limpiarComprobante
  } = useComprobantes();

  const {
    generandoPDF,
    imprimiendoMultiple,
    generarPDFIndividual,
    generarPDFsMultiples
  } = useGenerarPDFsVentas();

  // Handlers para eventos de la tabla
  const handleRowDoubleClick = async (venta) => {
    await cargarProductosVenta(venta);
    await cargarCuenta(venta);
    setMostrarModalDetalle(true);
  };

  const handleCloseModalDetalle = () => {
    setMostrarModalDetalle(false);
    cerrarEdicion();
  };

  // Handlers para comprobantes
  const handleCargarComprobante = async () => {
    if (!selectedVenta) {
      toast.error("Seleccione una venta primero");
      return;
    }
    
    limpiarComprobante();
    await verificarComprobanteExistente(selectedVenta.id);
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalComprobante(true), 300);
  };

  const handleCloseModalComprobante = () => {
    setMostrarModalComprobante(false);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  const handleUploadComprobante = async () => {
    if (!selectedVenta) return;
    
    const exito = await uploadComprobante(selectedVenta.id);
    if (exito) {
      setTimeout(() => {
        setMostrarModalComprobante(false);
        setTimeout(() => setMostrarModalDetalle(true), 300);
      }, 1500);
    }
  };

  const handleViewComprobante = () => {
    if (!selectedVenta) return;
    viewComprobante(selectedVenta.id);
  };

  // Handlers para PDFs
  const handleGenerarPDF = async () => {
    if (!selectedVenta || productos.length === 0) {
      toast.error("Seleccione una venta con productos");
      return;
    }

    await generarPDFIndividual(selectedVenta, productos);
  };

  // 🔧 CORREGIDO: Pasar las ventas completas seleccionadas
  const handleImprimirMultiple = async () => {
    const ventasSeleccionadas = ventasFiltradas.filter(venta => 
      selectedVentas.includes(venta.id)
    );
    
    if (ventasSeleccionadas.length === 0) {
      toast.error("Seleccione al menos una venta para imprimir");
      return;
    }

    console.log('🖨️ Ventas seleccionadas para imprimir:', ventasSeleccionadas.map(v => ({ id: v.id, cliente: v.cliente_nombre })));
    
    await generarPDFsMultiples(ventasSeleccionadas);
  };

  // Handlers para navegación
  const handleConfirmarSalida = () => {
    if (selectedVenta) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  const handleSolicitarCAE = () => {
    const ventasSinCAE = ventasFiltradas.filter(venta => 
      selectedVentas.includes(venta.id) && !venta.cae_id
    );
    
    if (ventasSinCAE.length === 0) {
      toast.error('Todas las ventas seleccionadas ya tienen CAE asignado');
      return;
    }
    
    toast.error('Funcionalidad por implementar.');
  };

  // 🆕 Limpiar selección cuando cambian los filtros
  const handleFiltrosChangeConLimpieza = (nuevosFiltros) => {
    handleFiltrosChange(nuevosFiltros);
    clearSelection(); // Limpiar selección al cambiar filtros
  };

  const handleLimpiarFiltrosConSeleccion = () => {
    limpiarFiltros();
    clearSelection(); // Limpiar selección al limpiar filtros
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE VENTAS</title>
        <meta name="description" content="Historial de ventas en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE VENTAS</h1>
        
        {/* 🆕 Componente de filtros */}
        <FiltrosHistorialVentas
          filtros={filtros}
          onFiltrosChange={handleFiltrosChangeConLimpieza}
          onLimpiarFiltros={handleLimpiarFiltrosConSeleccion}
          user={user}
          totalVentas={ventas.length}
          ventasFiltradas={ventasFiltradas.length}
          ventasOriginales={ventas}
        />
        
        <TablaVentas
          ventas={ventasActuales}
          selectedVentas={selectedVentas}
          onSelectVenta={(venta) => handleSelectVenta(venta.id)}
          onSelectAll={handleSelectAllVentas}
          onRowDoubleClick={handleRowDoubleClick}
          loading={loading}
        />
        
        <Paginacion
          datosOriginales={ventasFiltradas} // 🔄 Usar ventasFiltradas
          paginaActual={paginaActual}
          registrosPorPagina={registrosPorPagina}
          totalPaginas={totalPaginas}
          indexOfPrimero={indexOfPrimero}
          indexOfUltimo={indexOfUltimo}
          onCambiarPagina={cambiarPagina}
          onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
        />
        
        <BotonAcciones
          selectedVentas={selectedVentas}
          onImprimirMultiple={handleImprimirMultiple}
          imprimiendo={imprimiendoMultiple}
          onSolicitarCAE={handleSolicitarCAE}
          solicitando={false}
          onVolverMenu={handleConfirmarSalida}
        />
      </div>
      
      {/* Modal de detalles de venta - SIN BOTÓN ANULAR */}
      <ModalDetalleVenta
        venta={selectedVenta}
        productos={productos}
        loading={loadingProductos}
        onClose={handleCloseModalDetalle}
        onImprimirFacturaIndividual={handleGenerarPDF}
        onCargarComprobante={handleCargarComprobante}
        generandoPDF={generandoPDF}
        cuenta={cuenta}
      />

      {/* Modal comprobantes */}
      <ModalComprobantesVenta
        mostrar={mostrarModalComprobante}
        venta={selectedVenta}
        comprobante={comprobante}
        comprobantePreview={comprobantePreview}
        comprobanteExistente={comprobanteExistente}
        uploadingComprobante={uploadingComprobante}
        onClose={handleCloseModalComprobante}
        onFileChange={handleFileChange}
        onUpload={handleUploadComprobante}
        onView={handleViewComprobante}
      />

      {/* Modal confirmación salida */}
      <ModalConfirmacionSalida
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function HistorialVentas() {
  return <HistorialVentasContent />;
}