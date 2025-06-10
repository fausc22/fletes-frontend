function TablaEscritorio({ remitos, onRowDoubleClick }) {
  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded shadow text-black">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Cod.</th>
            <th className="p-2">Fecha</th>
            <th className="p-2">Cliente</th>
            <th className="p-2">Condición</th>
            <th className="p-2">CUIT</th>
            <th className="p-2">Teléfono</th>
            <th className="p-2">Dirección</th>
            <th className="p-2">Ciudad</th>
            <th className="p-2">Provincia</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {remitos.length > 0 ? (
            remitos.map((remito) => (
              <tr 
                key={remito.id} 
                className="hover:bg-gray-100 cursor-pointer"
                onDoubleClick={() => onRowDoubleClick(remito)}
              >
                <td className="p-2">{remito.id}</td>
                <td className="p-2">{remito.fecha}</td>
                <td className="p-2">{remito.cliente_nombre}</td>
                <td className="p-2">{remito.cliente_condicion}</td>
                <td className="p-2">{remito.cliente_cuit}</td>
                <td className="p-2">{remito.cliente_telefono}</td>
                <td className="p-2">{remito.cliente_direccion}</td>
                <td className="p-2">{remito.cliente_ciudad}</td>
                <td className="p-2">{remito.cliente_provincia}</td>
                <td className="p-2">{remito.estado}</td>
                <td className="p-2">{remito.observaciones}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="p-4 text-center text-gray-500">
                No hay remitos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasMoviles({ remitos, onRowDoubleClick }) {
  return (
    <div className="md:hidden space-y-4">
      {remitos.length > 0 ? (
        remitos.map((remito) => (
          <div 
            key={remito.id} 
            className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer"
            onClick={() => onRowDoubleClick(remito)}
          >
            <div className="flex justify-between">
              <span className="font-bold">Cod.:</span>
              <span>{remito.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Fecha:</span>
              <span>{remito.fecha}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Cliente:</span>
              <span>{remito.cliente_nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">CUIT:</span>
              <span>{remito.cliente_cuit}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Ciudad:</span>
              <span>{remito.cliente_ciudad}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Estado:</span>
              <span>{remito.estado}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-gray-500 bg-white rounded shadow">
          No hay remitos disponibles
        </div>
      )}
    </div>
  );
}

export default function TablaRemitos({ 
  remitos, 
  onRowDoubleClick,
  loading = false,
  filtroCliente 
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando remitos...</span>
      </div>
    );
  }

  const mensajeVacio = filtroCliente 
    ? "No se encontraron remitos para este cliente" 
    : "No hay remitos disponibles";

  return (
    <>
      <TablaEscritorio
        remitos={remitos}
        onRowDoubleClick={onRowDoubleClick}
      />
      
      <TarjetasMoviles
        remitos={remitos}
        onRowDoubleClick={onRowDoubleClick}
      />
    </>
  );
}