import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export function useHistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [selectedVentas, setSelectedVentas] = useState([]);
  const [loading, setLoading] = useState(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
  useEffect(() => {
    
    cargarVentas();
  }, []);



  const cargarVentas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/ventas/obtener-ventas`);
      setVentas(response.data);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      toast.error("No se pudieron cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVenta = (ventaId) => {
    if (selectedVentas.includes(ventaId)) {
      setSelectedVentas(selectedVentas.filter(id => id !== ventaId));
    } else {
      setSelectedVentas([...selectedVentas, ventaId]);
    }
  };

  const handleSelectAllVentas = (ventasVisibles) => {
    const todosSeleccionados = ventasVisibles.every(v => selectedVentas.includes(v.id));
    
    if (todosSeleccionados) {
      // Deseleccionar todos los visibles
      setSelectedVentas(selectedVentas.filter(id => !ventasVisibles.some(v => v.id === id)));
    } else {
      // Seleccionar todos los visibles que no estén ya seleccionados
      const nuevosIds = ventasVisibles.map(v => v.id).filter(id => !selectedVentas.includes(id));
      setSelectedVentas([...selectedVentas, ...nuevosIds]);
    }
  };

  const clearSelection = () => {
    setSelectedVentas([]);
  };

  return {
    ventas,
    selectedVentas,
    loading,
    cargarVentas,
    handleSelectVenta,
    handleSelectAllVentas,
    clearSelection
  };
}