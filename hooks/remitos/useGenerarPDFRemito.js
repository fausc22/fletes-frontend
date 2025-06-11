import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';



import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useGenerarPDFRemito() {
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const generarPDFRemito = async (remito, productos) => {
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
      
      toast.success("PDF generado con éxito");
      return true;
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast.error("Error al generar el PDF");
      return false;
    } finally {
      setGenerandoPDF(false);
    }
  };

  return {
    generandoPDF,
    generarPDFRemito
  };
}