// components/remitos/ModalDetalleRemito.jsx - Versión actualizada
import React, { useState } from "react";
import { toast } from 'react-hot-toast';
import { MdExpandMore, MdExpandLess } from "react-icons/md";

function InformacionCliente({ remito, expandido, onToggleExpansion }) {
  return (
    <div className="bg-green-50 rounded-lg overflow-hidden mb-4">
      {/* Información básica del cliente (siempre visible) */}
      <div 
        className="p-3 cursor-pointer hover:bg-green-100 transition-colors flex items-center justify-between"
        onClick={onToggleExpansion}
      >
        <div>
          <h3 className="font-bold text-lg text-green-800">Cliente: {remito.cliente_nombre}</h3>
          <p className="text-green-600 text-sm">
            {remito.cliente_ciudad || 'Ciudad no especificada'}
            {remito.cliente_provincia && `, ${remito.cliente_provincia}`}
          </p>
        </div>
        <div className="text-green-600">
          {expandido ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
        </div>
      </div>

      {/* Información detallada del cliente (expandible) */}
      <div className={`transition-all duration-300 ease-in-out ${
        expandido ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-3 pb-3 border-t border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-3">
            <div>
              <span className="font-medium text-green-700">Dirección:</span>
              <p className="text-gray-700">{remito.cliente_direccion || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">Condición IVA:</span>
              <p className="text-gray-700">{remito.cliente_condicion || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">CUIT:</span>
              <p className="text-gray-700">{remito.cliente_cuit || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">Teléfono:</span>
              <p className="text-gray-700">{remito.cliente_telefono || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InformacionAdicional({ remito }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Observaciones</h3>
          <p className="text-lg text-gray-700">
            {remito.observaciones || 'Sin observaciones especiales'}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Empleado</h3>
          <p className="text-lg font-semibold text-green-600">
            {remito.empleado_nombre || 'No especificado'}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Estado</h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              remito.estado === 'Activo' ? 'bg-green-100 text-green-800' :
              remito.estado === 'Entregado' ? 'bg-blue-100 text-blue-800' :
              remito.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
              remito.estado === 'Cancelado' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {remito.estado || 'Sin estado'}
            </span>
          </div>
        </div>
        {remito.venta_id && (
          <div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Venta Origen</h3>
            <p className="text-lg font-semibold text-blue-600">
              Venta #{remito.venta_id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TablaProductosEscritorio({ productos }) {
  return (
    <div className="hidden lg:block overflow-x-auto bg-white rounded shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-center">UM</th>
            <th className="p-2 text-center">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => {
            const cantidad = Number(producto.cantidad) || 0;
            
            return (
              <tr key={producto.id} className="hover:bg-gray-100 border-b">
                <td className="p-2 font-mono text-xs">{producto.producto_id}</td>
                <td className="p-2 font-medium">{producto.producto_nombre}</td>
                <td className="p-2 text-center">{producto.producto_um}</td>
                <td className="p-2 text-center font-semibold text-green-600">{cantidad}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasProductosMovil({ productos }) {
  return (
    <div className="lg:hidden space-y-3">
      {productos.map((producto) => {
        const cantidad = Number(producto.cantidad) || 0;
        
        return (
          <div key={producto.id} className="bg-white p-3 rounded shadow border">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">{producto.producto_nombre}</h4>
                <p className="text-xs text-gray-500">Código: {producto.producto_id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 block">UM:</span>
                <span className="font-medium">{producto.producto_um}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Cantidad:</span>
                <span className="font-semibold text-green-600">{cantidad}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TablaProductos({ productos, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        <span className="ml-2">Cargando productos...</span>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded shadow p-8 text-center text-gray-500">
        <div className="text-4xl mb-2">📦</div>
        <div className="font-medium">No hay productos en este remito</div>
      </div>
    );
  }

  return (
    <>
      <TablaProductosEscritorio productos={productos} />
      <TarjetasProductosMovil productos={productos} />
    </>
  );
}

function ResumenCantidades({ productos }) {
  // Calcular total de productos
  const totalProductos = productos.length;
  const totalCantidad = productos.reduce((acc, prod) => {
    const cantidad = Number(prod.cantidad) || 0;
    return acc + cantidad;
  }, 0);

  if (productos.length === 0) return null;

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
      <div className="space-y-2">
        <div className="flex justify-between items-center py-1 border-b border-gray-300 text-sm">
          <span className="text-gray-700 font-medium">PRODUCTOS DIFERENTES:</span>
          <span className="font-semibold text-gray-800">{totalProductos}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 bg-green-300 rounded-lg px-3 border-2 border-green-400">
          <span className="text-black font-bold">CANTIDAD TOTAL:</span>
          <span className="text-black text-lg font-bold">{totalCantidad.toFixed(3)}</span>
        </div>
      </div>
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
  const [clienteExpandido, setClienteExpandido] = useState(false);

  if (!remito) return null;

  const toggleClienteExpansion = () => {
    setClienteExpandido(!clienteExpandido);
  };

  const handleVerDetalleVenta = () => {
    if (remito.venta_id) {
      onVerDetalleVenta(remito.venta_id);
    } else {
      toast.info('Este remito no está asociado a una venta específica');
    }
  };

  const handleCerrarModal = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Detalles del Remito</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Fecha y Estado */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h4 className="text-lg font-semibold text-gray-700">
              <strong>Fecha:</strong> {remito.fecha}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                remito.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                remito.estado === 'Entregado' ? 'bg-blue-100 text-blue-800' :
                remito.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                remito.estado === 'Cancelado' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {remito.estado || 'Sin estado'}
              </span>
            </div>
          </div>
          
          {/* Información del Cliente (colapsable) */}
          <InformacionCliente 
            remito={remito} 
            expandido={clienteExpandido}
            onToggleExpansion={toggleClienteExpansion}
          />

          {/* Información Adicional */}
          <InformacionAdicional remito={remito} />
          
          {/* Sección de productos */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Productos del Remito</h3>
            </div>
            
            <TablaProductos
              productos={productos}
              loading={loading}
            />

            <ResumenCantidades productos={productos} />
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={onGenerarPDF}
              disabled={generandoPDF}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              {generandoPDF ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  Generando...
                </>
              ) : (
                'Imprimir Remito'
              )}
            </button>
            
            {remito.venta_id && (
              <button
                onClick={handleVerDetalleVenta}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Ver Venta Origen
              </button>
            )}
            
            <button
              onClick={handleCerrarModal}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}