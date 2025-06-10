import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';


const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
export function useDetalleRemito() {
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [remitoProductos, setRemitoProductos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const cargarDetalleRemito = async (remito) => {
    setSelectedRemito(remito);
    setModalIsOpen(true);
    setLoading(true);

    try {
      const response = await axios.get(`${apiUrl}/productos/obtener-productos-remito/${remito.id}`);
      setRemitoProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos del remito:", error);
      toast.error("No se pudieron cargar los productos del remito");
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setModalIsOpen(false);
    setSelectedRemito(null);
    setRemitoProductos([]);
  };

  return {
    selectedRemito,
    remitoProductos,
    modalIsOpen,
    loading,
    cargarDetalleRemito,
    cerrarModal
  };
}