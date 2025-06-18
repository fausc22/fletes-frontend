// components/remitos/TablaRemitos.jsx - Versión actualizada
import { useState } from 'react';

export default function TablaRemitos({
  remitos,
  selectedRemitos,
  onSelectRemito,
  onSelectAll,
  onRowDoubleClick,
  loading
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRemitos = [...remitos].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Manejar campos numéricos
    if (sortField === 'id') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }
    
    // Manejar fechas
    if (sortField === 'fecha') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Manejar texto
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Verificar si todos los remitos visibles están seleccionados
  const todosSeleccionados = remitos.length > 0 && remitos.every(remito => selectedRemitos.includes(remito.id));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-lg">Cargando remitos...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-center">
              <input
                type="checkbox"
                checked={todosSeleccionados}
                onChange={() => onSelectAll(remitos)}
                className="w-4 h-4"
              />
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => handleSort('id')}
            >
              ID {getSortIcon('id')}
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => handleSort('fecha')}
            >
              Fecha {getSortIcon('fecha')}
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => handleSort('cliente_nombre')}
            >
              Cliente {getSortIcon('cliente_nombre')}
            </th>
            <th className="p-3 text-left">Ciudad</th>
            <th className="p-3 text-left">Provincia</th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => handleSort('estado')}
            >
              Estado {getSortIcon('estado')}
            </th>
            <th className="p-3 text-left">Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedRemitos.length > 0 ? (
            sortedRemitos.map((remito) => (
              <tr
                key={remito.id}
                className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedRemitos.includes(remito.id) ? 'bg-green-50' : ''
                }`}
                onDoubleClick={() => onRowDoubleClick(remito)}
              >
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRemitos.includes(remito.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelectRemito(remito);
                    }}
                    className="w-4 h-4"
                  />
                </td>
                <td className="p-3 font-mono text-sm font-semibold text-green-600">
                  #{remito.id}
                </td>
                <td className="p-3">
                  {new Date(remito.fecha).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="p-3 font-medium">
                  {remito.cliente_nombre || 'Cliente no especificado'}
                </td>
                <td className="p-3">
                  {remito.cliente_ciudad || 'No especificada'}
                </td>
                <td className="p-3">
                  {remito.cliente_provincia || 'No especificada'}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    remito.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                    remito.estado === 'Entregado' ? 'bg-blue-100 text-blue-800' :
                    remito.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    remito.estado === 'Cancelado' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {remito.estado || 'Sin estado'}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                  {remito.observaciones || 'Sin observaciones'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="p-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">📄</div>
                  <div className="text-lg font-medium">No hay remitos registrados</div>
                  <div className="text-sm">Los remitos aparecerán aquí cuando se registren</div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {remitos.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {selectedRemitos.length > 0 && (
                <span className="font-medium text-green-600">
                  {selectedRemitos.length} de {remitos.length} seleccionados
                </span>
              )}
            </span>
            <span>
              Total de remitos: <span className="font-medium">{remitos.length}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}