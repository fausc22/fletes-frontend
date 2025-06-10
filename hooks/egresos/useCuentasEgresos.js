// hooks/egresos/useCuentasEgresos.js
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useEgresos } from '../../context/EgresosContext';


const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
export function useCuentasEgresos() {
  const { cuentas, setCuentas, setLoading } = useEgresos();

  const cargarCuentas = async () => {
    setLoading({ cuentas: true });
    try {
      const response = await axios.get(`${apiUrl}/finanzas/ingresos/cuentas`);
      if (response.data.success) {
        setCuentas(response.data.data);
      } else {
        toast.error("Error al cargar las cuentas");
      }
    } catch (error) {
      console.error("Error al obtener cuentas:", error);
      toast.error("No se pudieron cargar las cuentas");
    } finally {
      setLoading({ cuentas: false });
    }
  };

  return {
    cuentas,
    cargarCuentas
  };
}