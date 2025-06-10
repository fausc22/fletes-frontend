import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';



const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
export function useGenerarPDFPedido() {
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const generarPDFPedido = async (pedido, productos) => {
    if (!pedido || productos.length === 0) {
      toast.error("Seleccione un pedido con productos");
      return false;
    }

    setGenerandoPDF(true);

    try {
      const response = await axios.post(
        `${apiUrl}/pedidos/generarpdf-notapedido`,
        {
          pedido,
          productos,
        },
        { responseType: "blob" }
      );

      // Crear un link para descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `PEDIDO_${pedido.cliente_nombre}.pdf`;
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
    generarPDFPedido
  };
}