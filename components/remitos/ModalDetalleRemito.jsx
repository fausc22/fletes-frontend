function InformacionRemito({ remito }) {
  return (
    <>
      <h4 className="mt-2"><strong>Fecha:</strong> {remito.fecha}</h4>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
        {/* Información del Cliente */}
        <div className="w-full md:w-1/2">
          <h3 className="font-bold mb-2">Información del Cliente</h3>
          <p><strong>Cliente:</strong> {remito.cliente_nombre}</p>
          <p><strong>Dirección:</strong> {remito.cliente_direccion}</p>
          <p><strong>Ciudad:</strong> {remito.cliente_ciudad}</p>
          <p><strong>Provincia:</strong> {remito.cliente_provincia}</p>
          <p><strong>Condición IVA:</strong> {remito.cliente_condicion}</p>
          <p><strong>CUIT:</strong> {remito.cliente_cuit}</p>
        </div>
        
        {/* Información del Documento */}
        <div className="w-full md:w-1/2">
          <h3 className="font-bold mb-2">Información del Documento</h3>
          <p><strong>ESTADO:</strong> {remito.estado}</p>
          <p><strong>OBSERVACIONES:</strong> {remito.observaciones || "Sin observaciones"}</p>
        </div>
      </div>
    </>
  );
}

function TablaProductosRemito({ productos, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando productos...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Código</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Unidad Medida</th>
            <th className="p-2">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {productos.length > 0 ? (
            productos.map((producto) => (
              <tr key={producto.id} className="hover:bg-gray-100">
                <td className="p-2">{producto.producto_id}</td>
                <td className="p-2">{producto.producto_nombre}</td>
                <td className="p-2">{producto.producto_um}</td>
                <td className="p-2">{producto.cantidad}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No hay productos en este remito
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ModalDetalleRemito({ 
  remito,
  productos,
  loading,
  onClose,
  onGenerarPDF,
  onVerDetalleVenta,
  generandoPDF = false
}) {
  if (!remito) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Detalles del Remito</h2>
        
        <InformacionRemito remito={remito} />
        
        {/* Sección de productos */}
        <div className="mt-6">
          <h3 className="font-bold text-center mb-4">Productos</h3>
          <TablaProductosRemito productos={productos} loading={loading} />
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={onGenerarPDF}
            disabled={generandoPDF}
            className={`px-4 py-2 rounded text-white ${
              generandoPDF 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {generandoPDF ? 'GENERANDO...' : 'IMPRIMIR REMITO'}
          </button>
          <button 
            onClick={onVerDetalleVenta}
            className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded"
          >
            VER DETALLE VENTA
          </button>
        </div>
        
        <button 
          onClick={onClose}
          className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}