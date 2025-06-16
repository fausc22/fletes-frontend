// hooks/remitos/useGenerarPDFRemito.js - Versión actualizada
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useGenerarPDFRemito() {
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [imprimiendoMultiple, setImprimiendoMultiple] = useState(false);

  const generarPDFIndividual = async (remito, productos) => {
    if (!remito || productos.length === 0) {
      toast.error("Seleccione un remito con productos");
      return false;
    }

    setGenerandoPDF(true);

    try {
      const response = await axiosAuth.post(
        `/productos/generarpdf-remito`,
        {
          remito,
          productos,
        },
        { responseType: "blob" }
      );

      // Crear un link para descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `REMITO_${remito.cliente_nombre}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("PDF de remito generado con éxito");
      return true;
    } catch (error) {
      console.error("Error al generar PDF del remito:", error);
      toast.error("Error al generar el PDF del remito");
      return false;
    } finally {
      setGenerandoPDF(false);
    }
  };

  const generarPDFsMultiples = async (remitosSeleccionados) => {
    if (!remitosSeleccionados || remitosSeleccionados.length === 0) {
      toast.error("Seleccione al menos un remito para imprimir");
      return false;
    }

    setImprimiendoMultiple(true);

    try {
      // Extraer solo los IDs de los remitos seleccionados
      const remitosIds = remitosSeleccionados.map(remito => {
        // Si es un objeto, extraer el ID
        if (typeof remito === 'object' && remito !== null) {
          return remito.id;
        }
        // Si ya es un ID, devolverlo tal como está
        return remito;
      }).filter(id => id && !isNaN(parseInt(id))); // Filtrar IDs válidos

      console.log('📋 IDs de remitos para imprimir:', remitosIds);

      if (remitosIds.length === 0) {
        toast.error("No se encontraron IDs válidos de remitos");
        return false;
      }

      const response = await axiosAuth.post(
        `/productos/generarpdf-remitos-multiples`,
        { remitosIds }, // Solo enviar IDs, no objetos completos
        { responseType: "blob" }
      );

      // Crear un link para descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Remitos-Multiples.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(`${remitosIds.length} remitos generados con éxito`);
      return true;
    } catch (error) {
      console.error("Error al generar múltiples PDFs de remitos:", error);
      toast.error(`Error al generar los remitos: ${error.response?.data?.error || error.message}`);
      return false;
    } finally {
      setImprimiendoMultiple(false);
    }
  };

  return {
    generandoPDF,
    imprimiendoMultiple,
    generarPDFIndividual,
    generarPDFsMultiples
  };
}