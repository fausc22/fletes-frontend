import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { axiosAuth, fetchAuth } from '../../utils/apiClient';

export function useEditarPedido() {
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar productos de un pedido específico
  const cargarProductosPedido = async (pedido) => {
    setSelectedPedido(pedido);
    setLoading(true);
    
    try {
      const response = await axiosAuth.get(`/pedidos/productos/${pedido.id}`);
      
      if (response.data.success) {
        setProductos(response.data.data);
      } else {
        toast.error(response.data.message || 'Error al cargar productos');
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast.error("No se pudieron cargar los productos del pedido");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un producto ya existe en el pedido
  const verificarProductoDuplicado = (productoId) => {
    return productos.some(prod => prod.producto_id === productoId);
  };

  // Obtener información de stock de un producto
  const verificarStock = async (productoId) => {
    try {
      const response = await axiosAuth.get(`/productos/stock/${productoId}`);
      if (response.data.success) {
        return response.data.data.stock_actual || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error al verificar stock:', error);
      return 0;
    }
  };

  // Agregar producto a un pedido existente (con validaciones)
  const agregarProducto = async (producto, cantidad) => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    // 1. Verificar si el producto ya existe en el pedido
    if (verificarProductoDuplicado(producto.id)) {
      toast.error(`El producto "${producto.nombre}" ya está en el pedido. Use la opción editar para modificar la cantidad.`);
      return false;
    }

    // 2. Verificar stock disponible
    const stockDisponible = await verificarStock(producto.id);
    if (cantidad > stockDisponible) {
      toast.error(`Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${cantidad}`);
      return false;
    }

    const precio = parseFloat(producto.precio);
    const subtotalSinIva = parseFloat((precio * cantidad).toFixed(2));
    const porcentajeIva = producto.iva || 21; // Porcentaje de IVA
    const ivaCalculado = parseFloat((subtotalSinIva * (porcentajeIva / 100)).toFixed(2));

    const newProduct = {
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      producto_um: producto.unidad_medida || 'Unidad',
      cantidad,
      precio,
      iva: ivaCalculado, // IVA en pesos
      subtotal: subtotalSinIva, // Subtotal sin IVA
      stock_actual: stockDisponible // Guardar stock para validaciones futuras
    };

    try {
      const response = await axiosAuth.post(`/pedidos/agregar-producto/${selectedPedido.id}`, newProduct);
      
      if (response.data.success) {
        toast.success(`Producto agregado: ${cantidad} x ${producto.nombre}`);
        
        // ✅ SOLO RECARGAR PRODUCTOS - El backend ya actualizó los totales
        await cargarProductosPedido(selectedPedido);
        
        console.log('✅ Backend actualizó totales automáticamente:', response.data.data?.totales);
        return true;
      } else {
        toast.error(response.data.message || 'Error al agregar producto');
        return false;
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('stock')) {
          toast.error('Stock insuficiente en el servidor');
        } else if (error.response.data.message.includes('duplicado')) {
          toast.error('El producto ya existe en el pedido');
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('No se pudo agregar el producto');
      }
      return false;
    }
  };

  // Eliminar producto de un pedido
  const eliminarProducto = async (producto) => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    try {
      const response = await axiosAuth.delete(`/pedidos/eliminar-producto/${producto.id}`);
      
      if (response.data.success) {
        toast.success(`Producto eliminado: ${producto.producto_nombre}`);
        
        // ✅ SOLO RECARGAR PRODUCTOS - El backend ya actualizó los totales
        await cargarProductosPedido(selectedPedido);
        
        console.log('✅ Backend actualizó totales automáticamente:', response.data.data?.totales);
        return true;
      } else {
        toast.error(response.data.message || 'No se pudo eliminar el producto');
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar el producto');
      return false;
    }
  };

  // Actualizar producto (cantidad, precio) con validaciones de stock
  const actualizarProducto = async (producto) => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    const precio = parseFloat(producto.precio) || 0;
    const cantidad = parseInt(producto.cantidad) || 1;

    // Verificar stock antes de actualizar
    const stockDisponible = await verificarStock(producto.producto_id);
    if (cantidad > stockDisponible) {
      toast.error(`Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${cantidad}`);
      return false;
    }

    const subtotalSinIva = parseFloat((precio * cantidad).toFixed(2));
    
    // Calcular IVA basado en el porcentaje original del producto
    const porcentajeIva = 21; // Por defecto, pero idealmente debería venir del producto
    const ivaCalculado = parseFloat((subtotalSinIva * (porcentajeIva / 100)).toFixed(2));

    const updatedProduct = {
      cantidad,
      precio,
      iva: ivaCalculado,
      subtotal: subtotalSinIva
    };

    try {
      const response = await axiosAuth.put(
        `/pedidos/actualizar-producto/${producto.id}`,
        updatedProduct
      );

      if (response.data.success) {
        toast.success(`Producto actualizado: ${producto.producto_nombre}`);
        
        // ✅ SOLO RECARGAR PRODUCTOS - El backend ya actualizó los totales
        await cargarProductosPedido(selectedPedido);
        
        console.log('✅ Backend actualizó totales automáticamente:', response.data.data?.totales);
        return true;
      } else {
        toast.error(response.data.message || 'No se pudo actualizar el producto');
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.data?.message?.includes('stock')) {
        toast.error('Stock insuficiente en el servidor');
      } else {
        toast.error('Error al actualizar el producto');
      }
      return false;
    }
  };

  // Validar stock antes de proceder con cualquier operación
  const validarStockAntesDeProceder = async (productoId, cantidadSolicitada) => {
    const stockDisponible = await verificarStock(productoId);
    
    if (cantidadSolicitada > stockDisponible) {
      toast.error(`Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${cantidadSolicitada}`);
      return false;
    }
    
    return true;
  };

  // ❌ ELIMINAR: Esta función ya no es necesaria porque el backend calcula automáticamente
  // const actualizarTotalPedido = async () => { ... }

  // Actualizar observaciones del pedido
  const actualizarObservaciones = async (nuevasObservaciones) => {
    if (!selectedPedido) return false;

    try {
      const response = await axiosAuth.put(`/pedidos/actualizar-observaciones/${selectedPedido.id}`, {
        observaciones: nuevasObservaciones || 'sin observaciones'
      });

      if (response.data.success) {
        setSelectedPedido(prev => ({ ...prev, observaciones: nuevasObservaciones }));
        return true;
      } else {
        toast.error(response.data.message || 'Error al actualizar observaciones');
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar observaciones:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar observaciones';
      toast.error(errorMessage);
      return false;
    }
  };

  // Cerrar edición y limpiar estado
  const cerrarEdicion = () => {
    setSelectedPedido(null);
    setProductos([]);
  };

  // ✅ ACTUALIZAR: Obtener totales calculados dinámicamente (ahora solo para mostrar)
  const getTotales = () => {
    const subtotal = productos.reduce((acc, prod) => acc + parseFloat(prod.subtotal || 0), 0);
    const ivaTotal = productos.reduce((acc, prod) => acc + parseFloat(prod.iva || 0), 0);
    const total = subtotal + ivaTotal;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      ivaTotal: parseFloat(ivaTotal.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalProductos: productos.reduce((acc, prod) => acc + parseInt(prod.cantidad || 0), 0)
    };
  };

  // Función para obtener la lista de productos actuales (para validaciones)
  const getProductosActuales = () => {
    return productos;
  };

  return {
    // Estado
    selectedPedido,
    productos,
    loading,
    
    // Funciones principales
    cargarProductosPedido,
    agregarProducto,
    eliminarProducto,
    actualizarProducto,
    
    // Funciones auxiliares
    actualizarObservaciones,
    cerrarEdicion,
    getTotales, // Solo para mostrar en el modal
    getProductosActuales,
    
    // Funciones de validación
    verificarProductoDuplicado,
    verificarStock,
    validarStockAntesDeProceder
    
    // ❌ ELIMINAR: actualizarTotalPedido ya no es necesaria
  };
}