// hooks/useGenerarPDF.js
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
import { axiosAuth, fetchAuth } from '../../utils/apiClient';

export function useGenerarPDF() {
  const [loading, setLoading] = useState(false);
  const [pdfURL, setPdfURL] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null); // Guardamos el blob original
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
      
      // Guardar tanto la URL como el blob original
      setPdfBlob(blob); // Guardamos el blob para compartir
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
    
    toast.success('PDF descargado exitosamente');
  };

  // Función para compartir el PDF - VERSIÓN CORREGIDA
  const compartirPDF = async (nombreCliente) => {
    if (!pdfBlob) {
      toast.error('No hay PDF disponible para compartir');
      return;
    }

    try {
      const fileName = `Lista_Precios_${nombreCliente || 'Cliente'}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Verificar si el dispositivo soporta la Web Share API con archivos
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        // Usar Web Share API (móviles principalmente)
        await navigator.share({
          title: `Lista de Precios - ${nombreCliente || 'Cliente'}`,
          text: `Lista de precios generada para ${nombreCliente || 'el cliente'}`,
          files: [file]
        });
        
        toast.success('PDF compartido exitosamente');
      } else if (navigator.share) {
        // Si soporta Web Share API pero no archivos, crear URL temporal
        const tempUrl = window.URL.createObjectURL(pdfBlob);
        await navigator.share({
          title: `Lista de Precios - ${nombreCliente || 'Cliente'}`,
          text: `Lista de precios generada para ${nombreCliente || 'el cliente'}`,
          url: tempUrl
        });
        
        // Limpiar la URL temporal después de un tiempo
        setTimeout(() => {
          window.URL.revokeObjectURL(tempUrl);
        }, 30000); // 30 segundos
        
        toast.success('Enlace compartido exitosamente');
      } else {
        // Fallback para navegadores de escritorio
        await compartirFallback(pdfBlob, fileName);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Usuario canceló el compartir
        return;
      }
      
      console.error('Error al compartir:', error);
      
      // Si falla todo, intentar fallback
      try {
        await compartirFallback(pdfBlob, `Lista_Precios_${nombreCliente || 'Cliente'}.pdf`);
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
        toast.error('No se pudo compartir el archivo. Intenta descargarlo en su lugar.');
      }
    }
  };

  // Función fallback para compartir en navegadores de escritorio
  const compartirFallback = async (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    
    // Intentar copiar al portapapeles
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Enlace copiado al portapapeles. Puedes pegarlo para compartir.');
        
        // Limpiar la URL después de un tiempo
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 300000); // 5 minutos
        
        return;
      } catch (clipboardError) {
        console.log('No se pudo copiar al portapapeles:', clipboardError);
      }
    }
    
    // Si no se puede copiar, abrir en nueva ventana
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      toast.success('El PDF se abrió en una nueva ventana. Puedes compartir desde ahí.');
      
      // Limpiar la URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 300000); // 5 minutos
    } else {
      // Última alternativa: descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('El archivo se descargó. Puedes compartirlo desde tu gestor de archivos.');
    }
  };

  const cerrarModalPDF = () => {
    setMostrarModalPDF(false);
    
    // Limpiar las URLs para liberar memoria
    if (pdfURL) {
      window.URL.revokeObjectURL(pdfURL);
      setPdfURL(null);
    }
    
    // Limpiar el blob
    setPdfBlob(null);
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