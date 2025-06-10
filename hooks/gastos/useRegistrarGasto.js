import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function useRegistrarGasto() {
  const [loading, setLoading] = useState(false);

  const registrarGasto = async (formData) => {
    // Validar que los campos obligatorios existan en formData
    if (!formData.descripcion || !formData.monto || !formData.formaPago) {
      toast.error('Por favor complete los campos obligatorios: Descripción, Monto y Forma de Pago');
      return false;
    }

    setLoading(true);
    let gastoId = null; // Variable para almacenar el ID del gasto recién creado

    try {
      // Paso 1: Registrar el gasto sin el comprobante
      // Se envía como JSON para que el backend lo parsea correctamente
      const gastoResponse = await axios.post(
        `${apiUrl}/compras/nuevo-gasto`,
        {
          descripcion: formData.descripcion,
          monto: formData.monto,
          formaPago: formData.formaPago,
          observaciones: formData.observaciones,
          // Asegúrate de que 'empleadoId' se incluya en el 'formData' que pasas a este hook.
          // Por ejemplo, si lo obtienes de un contexto de autenticación o de un campo de formulario.
          empleadoId: formData.empleadoId,
        },
        {
          headers: {
            "Content-Type": "application/json", // Importante: enviar como JSON
          },
        }
      );

      // Si el registro del gasto inicial falla, mostrar error y salir
      if (!gastoResponse.data.success) {
        toast.error(gastoResponse.data.message || 'Error al registrar el gasto inicial');
        return false;
      }

      toast.success(gastoResponse.data.message || 'Gasto registrado con éxito');
      gastoId = gastoResponse.data.data.id; // Obtener el ID del gasto recién creado para el comprobante

      // Paso 2: Si existe un comprobante y se obtuvo un gastoId, subir el comprobante
      if (formData.comprobante && gastoId) {
        const comprobanteFormData = new FormData();
        comprobanteFormData.append("comprobante", formData.comprobante); // 'comprobante' es el nombre esperado por Multer

        const comprobanteResponse = await axios.post(
          `${apiUrl}/compras/guardarComprobanteGasto/${gastoId}`, // Usar el ID del gasto en la URL
          comprobanteFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data", // Importante: para enviar archivos
            },
          }
        );

        // Informar sobre el resultado de la subida del comprobante
        if (comprobanteResponse.data.success) {
          toast.success(comprobanteResponse.data.message || 'Comprobante subido con éxito');
        } else {
          // Si la subida del comprobante falla, notificar pero no impedir que el gasto ya registrado se considere exitoso
          toast.error(comprobanteResponse.data.message || 'Error al subir el comprobante. El gasto principal fue registrado.');
        }
      }

      return true; // Indicar que el proceso completo (gasto + comprobante opcional) fue exitoso
    } catch (error) {
      console.error('Error al registrar el gasto:', error);
      // Mensaje de error general, priorizando el mensaje del backend si existe
      toast.error(error.response?.data?.message || 'Error al registrar el gasto. Por favor, intente de nuevo.');
      return false;
    } finally {
      setLoading(false); // Siempre resetear el estado de carga
    }
  };

  return { registrarGasto, loading };
}
