// hooks/egresos/useDetalleEgresos.js
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useEgresos } from '../../context/EgresosContext';


const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
export function useDetalleEgresos() {
  const {
    detalle,
    setDetalle,
    setModal,
    setLoading
  } = useEgresos();

  const verDetalle = async (id, tipo) => {
    try {
      if (!id) {
        toast.error("ID no válido para consultar detalles");
        return;
      }
      
      setLoading({ operacion: true });
      let response;
      
      if (tipo === 'Compra') {
        response = await axios.get(`${apiUrl}/finanzas/egresos/detalle-compra/${id}`);
        setDetalle(response.data.data, 'compra');
      } else if (tipo === 'Gasto') {
        response = await axios.get(`${apiUrl}/finanzas/egresos/detalle-gasto/${id}`);
        setDetalle(response.data.data, 'gasto');
      } else {
        // Para egresos manuales del movimiento de fondos
        response = await axios.get(`${apiUrl}/finanzas/egresos/detalle-egreso/${id}`);
        setDetalle(response.data.data, 'egreso');
      }
      
      if (response.data.success) {
        setModal('detalle', true);
      } else {
        toast.error(`Error al cargar detalle del ${tipo.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Error al obtener detalle:`, error);
      toast.error(`No se pudo cargar el detalle. Error: ${error.message}`);
    } finally {
      setLoading({ operacion: false });
    }
  };

  const cerrarDetalle = () => {
    setModal('detalle', false);
    setDetalle(null, '');
  };

  const imprimirDetalle = (datos) => {
    // Implementar lógica de impresión específica
    toast.info("Funcionalidad de impresión en desarrollo");
  };

  return {
    detalle,
    verDetalle,
    cerrarDetalle,
    imprimirDetalle
  };
}