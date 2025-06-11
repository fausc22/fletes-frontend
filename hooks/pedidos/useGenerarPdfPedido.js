import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useGenerarPDFPedido() {
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [generandoPDFMultiple, setGenerandoPDFMultiple] = useState(false);

  // Función existente para generar PDF individual
  const generarPDFPedido = async (pedido, productos) => {
    if (!pedido || productos.length === 0) {
      toast.error("Seleccione un pedido con productos");
      return false;
    }

    setGenerandoPDF(true);

    try {
      const response = await axiosAuth.post(
        `/pedidos/generarpdf-notapedido`,
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

  // NUEVA FUNCIÓN para generar múltiples PDFs de pedidos
  const generarPDFsPedidosMultiples = async (pedidosIds) => {
    if (!pedidosIds || pedidosIds.length === 0) {
      toast.error("Seleccione al menos un pedido para imprimir");
      return false;
    }

    setGenerandoPDFMultiple(true);

    try {
      console.log('🖨️ Generando PDFs múltiples para pedidos:', pedidosIds);
      
      const response = await axiosAuth.post(
        `/pedidos/generarpdf-notaspedidos-multiples`,
        { pedidosIds },
        { responseType: "blob" }
      );

      // Crear un link para descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Notas-Pedidos-Multiples-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(`${pedidosIds.length} notas de pedido generadas con éxito`);
      return true;
    } catch (error) {
      console.error("Error al generar múltiples PDFs de pedidos:", error);
      
      // Mostrar mensaje de error más específico
      if (error.response?.status === 404) {
        toast.error("Endpoint no encontrado. Verifique que el backend soporte esta funcionalidad.");
      } else if (error.response?.status === 500) {
        toast.error("Error del servidor al generar los PDFs");
      } else {
        toast.error("Error al generar las notas de pedido");
      }
      
      return false;
    } finally {
      setGenerandoPDFMultiple(false);
    }
  };

  return {
    // Estados
    generandoPDF,
    generandoPDFMultiple,
    
    // Funciones
    generarPDFPedido,
    generarPDFsPedidosMultiples
  };
}