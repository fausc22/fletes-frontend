
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';


import { usePaginacion } from '../../hooks/usePaginacion';
import { useRemitos } from '../../hooks/remitos/useRemitos';
import { useDetalleRemito } from '../../hooks/remitos/useDetalleRemito';
import { useGenerarPDFRemito } from '../../hooks/remitos/useGenerarPDFRemito';


import { Paginacion } from '../../components/Paginacion';
import { FiltroCliente } from '../../components/FiltroCliente';
import TablaRemitos from '../../components/remitos/TablaRemitos';
import { ModalDetalleRemito } from '../../components/remitos/ModalDetalleRemito';


function HistorialRemitosContent() {
  useAuth();

  // Hooks de datos
  const {
    remitos,
    remitosFiltered,
    filtroCliente,
    loading,
    handleFiltroChange,
    limpiarFiltro
  } = useRemitos();

  // Hook de paginación reutilizado
  const {
    datosActuales: remitosActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  } = usePaginacion(remitosFiltered, 5);

  // Hook de detalle de remito
  const {
    selectedRemito,
    remitoProductos,
    modalIsOpen,
    loading: loadingDetalle,
    cargarDetalleRemito,
    cerrarModal
  } = useDetalleRemito();

  // Hook de PDF
  const {
    generandoPDF,
    generarPDFRemito
  } = useGenerarPDFRemito();

  // Handlers
  const handleRowDoubleClick = async (remito) => {
    await cargarDetalleRemito(remito);
    // Reset paginación cuando se aplica filtro
    if (remitosFiltered.length !== remitos.length) {
      cambiarPagina(1);
    }
  };

  const handleGenerarPDF = async () => {
    if (!selectedRemito || remitoProductos.length === 0) {
      toast.error("Seleccione un remito con productos");
      return;
    }
    
    await generarPDFRemito(selectedRemito, remitoProductos);
  };

  const handleVerDetalleVenta = () => {
    toast.info('Funcionalidad de detalle de venta pendiente de implementación');
  };

  const handleFiltroChangeConReset = (e) => {
    handleFiltroChange(e);
    // Reset a primera página cuando cambia el filtro
    cambiarPagina(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Remitos</title>
        <meta name="description" content="Historial de remitos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE REMITOS</h1>
        
        {/* Filtro por cliente */}
        <FiltroCliente
          filtroCliente={filtroCliente}
          onFiltroChange={handleFiltroChangeConReset}
          onLimpiarFiltro={limpiarFiltro}
          remitosFiltered={remitosFiltered.length}
          remitosTotal={remitos.length}
        />
        
        {/* Tabla de remitos */}
        <TablaRemitos
          remitos={remitosActuales}
          onRowDoubleClick={handleRowDoubleClick}
          loading={loading}
          filtroCliente={filtroCliente}
        />
        
        {/* Paginación reutilizada */}
        <Paginacion
          datosOriginales={remitosFiltered}
          paginaActual={paginaActual}
          registrosPorPagina={registrosPorPagina}
          totalPaginas={totalPaginas}
          indexOfPrimero={indexOfPrimero}
          indexOfUltimo={indexOfUltimo}
          onCambiarPagina={cambiarPagina}
          onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
        />
      </div>
      
      {/* Modal de detalle de remito */}
      <ModalDetalleRemito
        remito={selectedRemito}
        productos={remitoProductos}
        loading={loadingDetalle}
        onClose={cerrarModal}
        onGenerarPDF={handleGenerarPDF}
        onVerDetalleVenta={handleVerDetalleVenta}
        generandoPDF={generandoPDF}
      />
    </div>
  );
}

export default function HistorialRemitos() {
  return <HistorialRemitosContent />;
}