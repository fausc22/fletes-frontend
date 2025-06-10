
import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Hooks personalizados
import { useHistorialVentas } from '../../hooks/ventas/useHistorialVentas';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useEditarVenta } from '../../hooks/ventas/useEditarVenta';
import { useComprobantes } from '../../hooks/ventas/useComprobantes';
import { useGenerarPDFsVentas } from '../../hooks/ventas/useGenerarPDFsVentas';

// Componentes
import TablaVentas from '../../components/ventas/TablaVentas';
import { Paginacion } from '../../components/Paginacion';
import { ModalDetalleVenta } from '../../components/ventas/ModalesHistorialVentas';
import { ModalComprobantesVenta } from '../../components/ventas/ModalComprobantesVenta';
import { ModalAnulacionVenta, ModalConfirmacionSalida } from '../../components/ventas/ModalesConfirmacion';
import { BotonAcciones } from '../../components/ventas/BotonAcciones';
import Modal from 'react-responsive-modal';

function HistorialVentasContent() {
  // Estados para modales
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalAnulacion, setMostrarModalAnulacion] = useState(false);
  const [mostrarModalComprobante, setMostrarModalComprobante] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  const [selectedCuenta, setSelectedCuenta] = useState(null);



  useAuth();

  // Hooks personalizados
  const { ventas, selectedVentas, loading, handleSelectVenta, handleSelectAllVentas, clearSelection } = useHistorialVentas();
  
  const {
    datosActuales: ventasActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  } = usePaginacion(ventas, 10);

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

    console.log("Cuenta cargada2:", cuenta.nombre);

    setMostrarModalDetalle(true);
  };

  const handleCloseModalDetalle = () => {
    setMostrarModalDetalle(false);
    cerrarEdicion();
  };

  
  

  // Handlers para comprobantes
  const handleCargarComprobante = async () => {
    if (!selectedVenta) {
      toast.default.error("Seleccione una venta primero");
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
      toast.default.error("Seleccione una venta con productos");
      return;
    }

    await generarPDFIndividual(selectedVenta, productos);
  };

  const handleImprimirMultiple = async () => {
    await generarPDFsMultiples(selectedVentas);
  };

  // Handlers para navegación
  const handleConfirmarSalida = () => {
    if (selectedVenta) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleAnularVenta = async () => {
    setMostrarModalAnulacion(true);
    toast.error('Funcionalidad por implementar.');
  }

  const handleSalir = () => {
    window.location.href = '/';
  };

  const handleSolicitarCAE = () => {
    toast.error('Funcionalidad por implementar.');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE VENTAS</title>
        <meta name="description" content="Historial de ventas en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE VENTAS</h1>
        
        <TablaVentas
          ventas={ventasActuales}
          selectedVentas={selectedVentas}
          onSelectVenta={handleSelectVenta}
          onSelectAll={handleSelectAllVentas}
          onRowDoubleClick={handleRowDoubleClick}
          loading={loading}
        />
        
        <Paginacion
          datosOriginales={ventas}
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
          onVolverMenu={handleConfirmarSalida}
        />
        
      </div>
      
      {/* Modal de detalles de venta */}
      <ModalDetalleVenta
        venta={selectedVenta}
        productos={productos}
        loading={loadingProductos}
        onClose={handleCloseModalDetalle}
        onImprimirFacturaIndividual={handleGenerarPDF}
        onCargarComprobante={handleCargarComprobante}
        onSolicitarCAE={handleSolicitarCAE}
        generandoPDF={generandoPDF}
        onAnularVenta={handleAnularVenta}
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

      <ModalAnulacionVenta
              mostrar={mostrarModalAnulacion}
              onConfirmar={handleAnularVenta}
              onCancelar={() => setMostrarModalAnulacion(false)}
              loading={loading}
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