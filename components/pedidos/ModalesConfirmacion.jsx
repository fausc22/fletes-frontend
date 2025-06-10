// components/pedidos/ModalesConfirmacionPedidos.jsx

export function ModalConfirmacionPedido({ 
  mostrar, 
  cliente, 
  totalProductos, 
  total, 
  onConfirmar, 
  onCancelar,
  loading = false 
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center">Confirmar Pedido</h3>
        <div className="text-center mb-6">
          <p className="mb-2">
            ¿Deseas confirmar el pedido para el cliente{' '}
            <span className="font-bold">{cliente?.nombre}</span> con una cantidad de{' '}
            <span className="font-bold">{totalProductos}</span> productos y un total de{' '}
            <span className="font-bold text-green-700">${Number(total).toFixed(2)}</span>?
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Sí, Confirmar'}
          </button>
          <button
            onClick={onCancelar}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalConfirmacionSalidaPedidos({ mostrar, onConfirmar, onCancelar }) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center">
          ¿Estás seguro que deseas salir?
        </h3>
        <div className="text-center mb-6">
          <p className="mb-2">Se cerrará el historial de pedidos.</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
          >
            Sí, Salir
          </button>
          <button
            onClick={onCancelar}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
          >
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalConfirmacionCambioEstado({ 
  mostrar, 
  pedidosSeleccionados, 
  nuevoEstado, 
  onConfirmar, 
  onCancelar,
  loading = false 
}) {
  if (!mostrar) return null;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Exportado': return 'text-yellow-600';
      case 'Facturado': return 'text-green-600';
      case 'Anulado': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center">Confirmar Cambio de Estado</h3>
        <div className="text-center mb-6">
          <p className="mb-2">
            ¿Deseas cambiar el estado de{' '}
            <span className="font-bold">{pedidosSeleccionados}</span> pedido(s) a{' '}
            <span className={`font-bold ${getEstadoColor(nuevoEstado)}`}>{nuevoEstado}</span>?
          </p>
          <p className="text-sm text-gray-600">Esta acción se aplicará a todos los pedidos seleccionados.</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Sí, Cambiar'}
          </button>
          <button
            onClick={onCancelar}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalConfirmacionEliminarMultiple({ 
  mostrar, 
  pedidosSeleccionados, 
  onConfirmar, 
  onCancelar,
  loading = false 
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center text-red-600">⚠️ Confirmar Eliminación</h3>
        <div className="text-center mb-6">
          <p className="mb-2">
            ¿Estás seguro de eliminar{' '}
            <span className="font-bold text-red-600">{pedidosSeleccionados}</span> pedido(s)?
          </p>
          <p className="text-sm text-red-600 font-medium">
            Esta acción es IRREVERSIBLE y eliminará los pedidos y todos sus productos.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
          <button
            onClick={onCancelar}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}