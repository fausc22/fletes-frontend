// hooks/ingresos/useDetalleIngresos.js
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useIngresos } from '../../context/IngresosContext';


import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useDetalleIngresos() {
  const {
    detalle,
    setDetalle,
    setModal,
    setLoading
  } = useIngresos();

  const verDetalle = async (id, tipo) => {
    try {
      // Verificar que tenemos un ID válido
      if (!id) {
        toast.error("No se puede obtener detalle: ID no válido");
        return;
      }
      
      setLoading({ operacion: true });
      console.log(`Consultando detalle de ${tipo} con ID: ${id}`);
      let response;

      if (tipo === 'Venta') {
        response = await axiosAuth.get(`/ingresos/detalle-venta/${id}`);
      } else {
        response = await axiosAuth.get(`/ingresos/detalle-ingreso/${id}`);
      }
      
      if (response.data.success) {
        setDetalle(response.data.data, tipo.toLowerCase());
        setModal('detalle', true);
      } else {
        toast.error(`Error al cargar detalle del ${tipo.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Error al obtener detalle:`, error);
      toast.error(`No se pudo cargar el detalle. ${error.message}`);
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