import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { PedidosProvider, usePedidosContext } from '../../context/PedidosContext';
import { usePedidos } from '../../hooks/pedidos/usePedidos';

import ClienteSelector from '../../components/ventas/SelectorClientes';
import ProductoSelector from '../../components/ventas/SelectorProductos';
import ProductosCarrito from '../../components/ventas/ProductosCarrito';
import ObservacionesPedidos from '../../components/ventas/ObservacionesPedidos';
import { ModalConfirmacionVenta, ModalConfirmacionSalida } from '../../components/ventas/ModalesConfirmacion';

function RegistrarPedidoContent() {

  const { 
    cliente, 
    productos, 
    observaciones,
    total, 
    totalProductos,
    clearPedido,
    getDatosPedido 
  } = usePedidosContext();
 

  const { registrarPedido, loading, isOnline } = usePedidos();
  const { user } = useAuth();

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);


  const handleConfirmarVenta = () => {
    if (!cliente) {
      toast.error('Debe seleccionar un cliente.');
      return;
    }
    
    if (productos.length === 0) {
      toast.error('Debe agregar al menos un producto.');
      return;
    }
    
    setMostrarConfirmacion(true);
  };

  const handleRegistrarPedido = async () => {
    const datosPedido = getDatosPedido();
    const datosCompletos = {
      ...datosPedido,
      empleado: user
    };
    
    const resultado = await registrarPedido(datosCompletos);
    
    if (resultado.success) {
      clearPedido();
      setMostrarConfirmacion(false);
      
      if (resultado.offline) {
        // Mostrar información sobre modo offline
        setTimeout(() => {
          toast.info('💡 Puede revisar sus pedidos offline en el menú "Exportar Nota de Pedido"');
        }, 2000);
      }
    }
  };


  const handleConfirmarSalida = () => {
    if (cliente || productos.length > 0 || observaciones.trim()) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  const hayDatos = cliente || productos.length > 0 || observaciones.trim();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | NUEVO PEDIDO</title>
        <meta name="description" content="Sistema de registro de ventas" />
      </Head>

      {/* Indicador de estado de conexión */}
      <div className="w-full max-w-6xl mb-4">
        <div className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-sm font-medium">
            {isOnline 
              ? '🌐 Conectado - Los pedidos se guardarán inmediatamente' 
              : '📱 Modo Offline - Los pedidos se sincronizarán cuando haya conexión'
            }
          </span>
        </div>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-center">NUEVO PEDIDO</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <ClienteSelector />
          <ProductoSelector />
        </div>

        <ProductosCarrito />

        {/* Campo de observaciones */}
        <ObservacionesPedidos />
        
        {/* Resumen y botones */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="text-lg font-semibold text-gray-800">
              <p>Total de productos: <span className="text-blue-600">{totalProductos}</span></p>
              <p>Total del pedido: <span className="text-green-600">${total.toFixed(2)}</span></p>
            </div>
            
            {!isOnline && hayDatos && (
              <div className="mt-2 sm:mt-0 text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded">
                ⚠️ Se guardará offline
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button 
              className={`px-6 py-3 rounded text-white font-semibold transition-colors ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={handleConfirmarPedido}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </div>
              ) : (
                isOnline ? 'Confirmar Pedido' : 'Guardar Pedido Offline'
              )}
            </button>
            
            <button 
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded text-white font-semibold transition-colors"
              onClick={handleConfirmarSalida}
              disabled={loading}
            >
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
      
      <ModalConfirmacionPedido
        mostrar={mostrarConfirmacion}
        cliente={cliente}
        totalProductos={totalProductos}
        total={total}
        observaciones={observaciones}
        isOnline={isOnline}
        onConfirmar={handleRegistrarPedido}
        onCancelar={() => setMostrarConfirmacion(false)}
        loading={loading}
      />

      <ModalConfirmacionSalida
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function RegistrarPedido() {
  return (
    <PedidosProvider>
      <RegistrarPedidoContent />
    </PedidosProvider>
  );
}