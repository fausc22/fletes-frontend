// components/dinero/MovimientoCard.jsx - SISTEMA DE FLETES
import { useState } from 'react';

export default function MovimientoCard({ 
  movimiento, 
  onEdit, 
  onDelete, 
  showActions = true 
}) {
  const [loading, setLoading] = useState(false);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Está seguro de eliminar este ${movimiento.tipo.toLowerCase()}?`)) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(movimiento.id, movimiento.tipo);
    } catch (error) {
      console.error('Error eliminando movimiento:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = () => {
    if (movimiento.tipo === 'INGRESO') {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
        </svg>
      );
    }
  };

  const getTipoBadge = () => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    if (movimiento.tipo === 'INGRESO') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  const getAmountColor = () => {
    return movimiento.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600';
  };

  const getAmountPrefix = () => {
    return movimiento.tipo === 'INGRESO' ? '+' : '-';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${movimiento.tipo === 'INGRESO' ? 'bg-green-100' : 'bg-red-100'}`}>
            {getTipoIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{movimiento.nombre}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={getTipoBadge()}>
                {movimiento.tipo}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(movimiento.fecha)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`text-2xl font-bold ${getAmountColor()}`}>
            {getAmountPrefix()}{formatMoney(Math.abs(movimiento.total))}
          </p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="space-y-2 mb-4">
        {/* Camión */}
        {movimiento.patente && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
              <circle cx="7" cy="19" r="2"/>
              <circle cx="17" cy="19" r="2"/>
            </svg>
            <span>
              {movimiento.patente} - {movimiento.marca} {movimiento.modelo}
            </span>
          </div>
        )}

        {/* Categoría */}
        {movimiento.categoria_nombre && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c1.1 0 2 .9 2 2v1M9 21h6c1.1 0 2-.9 2-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10c0 1.1.9 2 2 2z"/>
            </svg>
            <span>{movimiento.categoria_nombre}</span>
          </div>
        )}

        {/* Descripción */}
        {movimiento.descripcion && (
          <div className="flex items-start text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{movimiento.descripcion}</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      {showActions && (
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => onEdit(movimiento)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
            <span>Editar</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
            disabled={loading}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            )}
            <span>Eliminar</span>
          </button>
        </div>
      )}
    </div>
  );
}