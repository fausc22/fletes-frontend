// pages/remitos/Remitos.jsx - Versión completa actualizada
import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Hooks personalizados
import { useRemitos } from '../../hooks/remitos/useRemitos';
import { useFiltrosRemitos } from '../../hooks/remitos/useFiltrosRemitos';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useDetalleRemito } from '../../hooks/remitos/useDetalleRemito';
import { useGenerarPDFRemito } from '../../hooks/remitos/useGenerarPDFRemito';

// Componentes
import FiltrosHistorialRemitos from '../../components/remitos/FiltrosHistorialRemitos';
import TablaRemitos from '../../components/remitos/TablaRemitos';
import { Paginacion } from '../../components/Paginacion';
import { ModalDetalleRemito } from '../../components/remitos/ModalDetalleRemito';
import { BotonAccionesRemitos } from '../../components/remitos/BotonAccionesRemitos';
import { ModalConfirmacionSalida } from '../../components/ventas/ModalesConfirmacion';

function HistorialRemitosContent() {
  // Estados para modales
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  const { user } = useAuth();

  // Hooks personalizados
  const { 
    remitos, 
    selectedRemitos, 
    loading, 
    handleSelectRemito, 
    handleSelectAllRemitos, 
    clearSelection 
  } = useRemitos();
  
  // Hook de filtros para remitos
  const { 
    filtros, 
    remitosFiltrados, 
    handleFiltrosChange, 
    limpiarFiltros 
  } = useFiltrosRemitos(remitos);
  
  const {
    datosActuales: remitosActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  } = usePaginacion(remitosFiltrados, 10);

  const {
    selectedRemito,
    productos,
    loading: loadingProductos,
    cargarProductosRemito,
    cerrarDetalle
  } = useDetalleRemito();

  const {
    generandoPDF,
    imprimiendoMultiple,
    generarPDFIndividual,
    generarPDFsMultiples
  } = useGenerarPDFRemito();

  // Handlers para eventos de la tabla
  const handleRowDoubleClick = async (remito) => {
    await cargarProductosRemito(remito);
    setMostrarModalDetalle(true);
  };

  const handleCloseModalDetalle = () => {
    setMostrarModalDetalle(false);
    cerrarDetalle();
  };

  // Handlers para PDFs
  const handleGenerarPDF = async () => {
    if (!selectedRemito || productos.length === 0) {
      toast.error("Seleccione un remito con productos");
      return;
    }

    await generarPDFIndividual(selectedRemito, productos);
  };

  // Corregir la impresión múltiple: pasar los remitos completos seleccionados
  const handleImprimirMultiple = async () => {
    const remitosSeleccionados = remitosFiltrados.filter(remito => 
      selectedRemitos.includes(remito.id)
    );
    
    if (remitosSeleccionados.length === 0) {
      toast.error("Seleccione al menos un remito para imprimir");
      return;
    }

    console.log('🖨️ Remitos seleccionados para imprimir:', remitosSeleccionados.map(r => ({ id: r.id, cliente: r.cliente_nombre })));
    
    await generarPDFsMultiples(remitosSeleccionados);
  };

  // Handler para ver detalle de venta
  const handleVerDetalleVenta = (ventaId) => {
    // TODO: Implementar navegación a detalle de venta
    toast.info(`Funcionalidad para ver venta #${ventaId} pendiente de implementación`);
  };

  // Handlers para navegación
  const handleConfirmarSalida = () => {
    if (selectedRemito) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  // Limpiar selección cuando cambian los filtros
  const handleFiltrosChangeConLimpieza = (nuevosFiltros) => {
    handleFiltrosChange(nuevosFiltros);
    clearSelection();
  };

  const handleLimpiarFiltrosConSeleccion = () => {
    limpiarFiltros();
    clearSelection();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE REMITOS</title>
        <meta name="description" content="Historial de remitos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE REMITOS</h1>
        
        {/* Componente de filtros */}
        <FiltrosHistorialRemitos
          filtros={filtros}
          onFiltrosChange={handleFiltrosChangeConLimpieza}
          onLimpiarFiltros={handleLimpiarFiltrosConSeleccion}
          user={user}
          totalRemitos={remitos.length}
          remitosFiltrados={remitosFiltrados.length}
          remitosOriginales={remitos}
        />
        
        <TablaRemitos
          remitos={remitosActuales}
          selectedRemitos={selectedRemitos}
          onSelectRemito={(remito) => handleSelectRemito(remito.id)}
          onSelectAll={handleSelectAllRemitos}
          onRowDoubleClick={handleRowDoubleClick}
          loading={loading}
        />
        
        <Paginacion
          datosOriginales={remitosFiltrados}
          paginaActual={paginaActual}
          registrosPorPagina={registrosPorPagina}
          totalPaginas={totalPaginas}
          indexOfPrimero={indexOfPrimero}
          indexOfUltimo={indexOfUltimo}
          onCambiarPagina={cambiarPagina}
          onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
        />
        
        <BotonAccionesRemitos
          selectedRemitos={selectedRemitos}
          onImprimirMultiple={handleImprimirMultiple}
          imprimiendo={imprimiendoMultiple}
          onVolverMenu={handleConfirmarSalida}
        />
      </div>
      
      {/* Modal de detalles de remito */}
      <ModalDetalleRemito
        remito={selectedRemito}
        productos={productos}
        loading={loadingProductos}
        onClose={handleCloseModalDetalle}
        onGenerarPDF={handleGenerarPDF}
        onVerDetalleVenta={handleVerDetalleVenta}
        generandoPDF={generandoPDF}
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

export default function HistorialRemitos() {
  return <HistorialRemitosContent />;
}