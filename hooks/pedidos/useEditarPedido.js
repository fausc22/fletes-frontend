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

  // Agregar producto a un pedido existente
  const agregarProducto = async (producto, cantidad) => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
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
      subtotal: subtotalSinIva // Subtotal sin IVA
    };

    try {
      const response = await axiosAuth.post(`/pedidos/agregar-producto/${selectedPedido.id}`, newProduct);
      
      if (response.data.success) {
        toast.success(`Producto agregado: ${cantidad} x ${producto.nombre}`);
        await cargarProductosPedido(selectedPedido);
        await actualizarTotalPedido();
        return true;
      } else {
        toast.error(response.data.message || 'Error al agregar producto');
        return false;
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
      toast.error('No se pudo agregar el producto');
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
        await cargarProductosPedido(selectedPedido);
        await actualizarTotalPedido();
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

  // Actualizar producto (cantidad, precio)
  const actualizarProducto = async (producto) => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    const precio = parseFloat(producto.precio) || 0;
    const cantidad = parseInt(producto.cantidad) || 1;
    const subtotalSinIva = parseFloat((precio * cantidad).toFixed(2));
    
    // Calcular IVA basado en el porcentaje original del producto
    // Asumiendo que el porcentaje se puede obtener del producto actual
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
        await cargarProductosPedido(selectedPedido);
        await actualizarTotalPedido();
        return true;
      } else {
        toast.error(response.data.message || 'No se pudo actualizar el producto');
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast.error('Error al actualizar el producto');
      return false;
    }
  };

  // Actualizar totales del pedido
  const actualizarTotalPedido = async () => {
    if (!selectedPedido) return;

    // Calcular nuevos totales
    const subtotalTotal = productos.reduce((acc, prod) => acc + parseFloat(prod.subtotal || 0), 0);
    const ivaTotal = productos.reduce((acc, prod) => acc + parseFloat(prod.iva || 0), 0);
    const total = subtotalTotal + ivaTotal;

    const totalesActualizados = {
      subtotal: parseFloat(subtotalTotal.toFixed(2)),
      iva_total: parseFloat(ivaTotal.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };

    try {
      const response = await axiosAuth.put(`/pedidos/actualizar-totales/${selectedPedido.id}`, totalesActualizados);

      if (response.data.success) {
        setSelectedPedido(prev => ({ 
          ...prev, 
          subtotal: totalesActualizados.subtotal,
          iva_total: totalesActualizados.iva_total,
          total: totalesActualizados.total
        }));
      }
    } catch (error) {
      console.error("Error al actualizar totales:", error);
      toast.error("No se pudieron actualizar los totales");
    }
  };

  // Actualizar observaciones del pedido
  const actualizarObservaciones = async (nuevasObservaciones) => {
    if (!selectedPedido) return false;

    try {
      const response = await axiosAuth.put(`/pedidos/actualizar-observaciones/${selectedPedido.id}`, {
        observaciones: nuevasObservaciones || 'sin observaciones'
      });

      if (response.data.success) {
        setSelectedPedido(prev => ({ ...prev, observaciones: nuevasObservaciones }));
        toast.success('Observaciones actualizadas');
        return true;
      } else {
        toast.error('Error al actualizar observaciones');
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar observaciones:', error);
      toast.error('Error al actualizar observaciones');
      return false;
    }
  };

  // Cerrar edición y limpiar estado
  const cerrarEdicion = () => {
    setSelectedPedido(null);
    setProductos([]);
  };

  // Obtener totales calculados dinámicamente
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
    getTotales,
    
    // Función interna (por si la necesitas)
    actualizarTotalPedido
  };
}