import { useState } from 'react';


const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  

export function useClienteSearch() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const buscarCliente = async () => {
    if (!busqueda.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/pedidos/filtrar-cliente?search=${encodeURIComponent(busqueda)}`);

      if (!res.ok) throw new Error('Respuesta no OK del servidor');
      
      const data = await res.json();
      setResultados(data.data);
      setMostrarModal(true);
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setResultados([]);
    setMostrarModal(false);
  };

  return {
    busqueda,
    setBusqueda,
    resultados,
    loading,
    mostrarModal,
    setMostrarModal,
    buscarCliente,
    limpiarBusqueda
  };
}

