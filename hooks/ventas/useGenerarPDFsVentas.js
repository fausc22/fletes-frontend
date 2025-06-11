import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  import { axiosAuth, fetchAuth } from '../../utils/apiClient';

export function useGenerarPDFsVentas() {
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [imprimiendoMultiple, setImprimiendoMultiple] = useState(false);

  const generarPDFIndividual = async (venta, productos) => {
    if (!venta || productos.length === 0) {
      toast.error("Seleccione una venta con productos");
      return false;
    }

    setGenerandoPDF(true);

    try {
      const response = await axiosAuth.post(
        `/ventas/generarpdf-factura`,
        {
          venta,
          productos,
        },
        { responseType: "blob" }
      );

      // Crear un link para descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `FACTURA - ${venta.cliente_nombre}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("PDF generado con éxito");
      return true;
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el PDF");
      return false;
    } finally {
      setGenerandoPDF(false);
    }
  };

  const generarPDFsMultiples = async (ventasIds) => {
    if (ventasIds.length === 0) {
      toast.error("Seleccione al menos una venta para imprimir");
      return false;
    }

    setImprimiendoMultiple(true);

    try {
      const response = await axiosAuth.post(
        `/ventas/generarpdf-facturas-multiples`,
        { ventasIds },
        { responseType: "blob" }
      );

      // Crear un link para descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Facturas-Multiples.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(`${ventasIds.length} facturas generadas con éxito`);
      return true;
    } catch (error) {
      console.error("Error al generar múltiples PDFs:", error);
      toast.error("Error al generar las facturas");
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