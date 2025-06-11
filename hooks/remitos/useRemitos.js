import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useRemitos() {
  const [remitos, setRemitos] = useState([]);
  const [remitosFiltered, setRemitosFiltered] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRemitos();
  }, []);

  useEffect(() => {
    filtrarRemitos();
  }, [filtroCliente, remitos]);

  const cargarRemitos = async () => {
    setLoading(true);
    try {
      const response = await axiosAuth.get(`/productos/obtener-remitos`);
      setRemitos(response.data);
      setRemitosFiltered(response.data);
    } catch (error) {
      console.error("Error al obtener remitos:", error);
      toast.error("No se pudieron cargar los remitos");
    } finally {
      setLoading(false);
    }
  };

  const filtrarRemitos = () => {
    if (!filtroCliente.trim()) {
      setRemitosFiltered(remitos);
    } else {
      const filtrados = remitos.filter(remito => 
        remito.cliente_nombre.toLowerCase().includes(filtroCliente.toLowerCase())
      );
      setRemitosFiltered(filtrados);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltroCliente(e.target.value);
  };

  const limpiarFiltro = () => {
    setFiltroCliente('');
  };

  return {
    remitos,
    remitosFiltered,
    filtroCliente,
    loading,
    handleFiltroChange,
    limpiarFiltro,
    cargarRemitos
  };
}