// hooks/useGenerarPDF.js
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  import { axiosAuth, fetchAuth } from '../../utils/apiClient';

export function useGenerarPDF() {
  const [loading, setLoading] = useState(false);
  const [pdfURL, setPdfURL] = useState(null);
  const [mostrarModalPDF, setMostrarModalPDF] = useState(false);

  const generarPdfListaPrecios = async (cliente, productos) => {
    if (!cliente || productos.length === 0) {
      toast.error('Debe seleccionar un cliente y agregar al menos un producto.');
      return false;
    }

    setLoading(true);
    
    try {
      // Preparar datos para enviar al servidor
      const datosListaPrecios = {
        cliente: {
          nombre: cliente.nombre,
          cuit: cliente.cuit || '',
          condicion_iva: cliente.condicion_iva || ''
        },
        productos: productos.map(p => ({
          id: p.id,
          nombre: p.nombre,
          unidad_medida: p.unidad_medida || 'Unidad',
          cantidad: p.cantidad,
          precio: parseFloat(p.precio),
          iva: parseFloat(p.iva || 0),
          subtotal: parseFloat(p.subtotal)
        }))
      };

      // Realizar la solicitud para generar el PDF
      const response = await axiosAuth({
        url: `/ventas/generarpdf-listaprecio`,
        method: 'POST',
        data: datosListaPrecios,
        responseType: 'blob' // Importante para recibir datos binarios
      });

      // Crear una URL para el blob del PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Guardar la URL del PDF y mostrar el modal
      setPdfURL(url);
      setMostrarModalPDF(true);
      
      toast.success('PDF generado con éxito');
      return true;
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      toast.error('Error al generar el PDF');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar el PDF
  const descargarPDF = (nombreCliente) => {
    if (!pdfURL) return;
    
    const link = document.createElement('a');
    link.href = pdfURL;
    link.download = `Lista_Precios_${nombreCliente || 'Cliente'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para compartir el PDF
  const compartirPDF = async (nombreCliente) => {
    if (!pdfURL) return;

    try {
      // Verificar si el navegador soporta Web Share API
      if (navigator.share) {
        // Convertir la URL del blob a un archivo
        const response = await fetchAuth(pdfURL);
        const blob = await response.blob();
        const file = new File([blob], `Lista_Precios_${nombreCliente || 'Cliente'}.pdf`, { type: 'application/pdf' });
        
        await navigator.share({
          title: 'Lista de Precios',
          text: `Lista de Precios para ${nombreCliente}`,
          files: [file]
        });
      } else {
        // Fallback para navegadores que no soportan Web Share API
        toast.info('Compartir no está disponible en este navegador. Por favor descargue el PDF.');
        descargarPDF(nombreCliente);
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      toast.error('Error al compartir el PDF');
    }
  };

  const cerrarModalPDF = () => {
    setMostrarModalPDF(false);
    if (pdfURL) {
      window.URL.revokeObjectURL(pdfURL);
      setPdfURL(null);
    }
  };

  return {
    loading,
    pdfURL,
    mostrarModalPDF,
    generarPdfListaPrecios,
    descargarPDF,
    compartirPDF,
    cerrarModalPDF
  };
}