import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';


const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
export function useRegistrarCompra() {
  const [loading, setLoading] = useState(false);

  const registrarCompra = async (proveedor, productos, total) => {
    if (!proveedor || productos.length === 0) {
      toast.error('Debe seleccionar un proveedor y agregar al menos un producto.');
      return false;
    }

    setLoading(true);
    
    try {
      const compraData = {
        proveedor_id: proveedor.id,
        proveedor_nombre: proveedor.nombre,
        proveedor_cuit: proveedor.cuit,
        total: total.toFixed(2),
        fecha: new Date().toISOString().slice(0, 10),
        productos: productos
      };

      const response = await axios.post(`${apiUrl}/compras/registrarCompra`, compraData);
      
      if (response.data.success) {
        toast.success('Compra registrada con éxito');
        return true;
      } else {
        toast.error(response.data.message || 'Error al registrar la compra');
        return false;
      }
    } catch (error) {
      console.error('Error al registrar la compra:', error);
      toast.error('Error al registrar la compra');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { registrarCompra, loading };
}