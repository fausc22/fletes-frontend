import { useGasto } from '../../context/GastosContext';

export function useFormularioGasto() {
  const { formData, setField } = useGasto();

  // Opciones predefinidas
  const opcionesDescripcion = ['NAFTA', 'VIANDA', 'MANTENIMIENTO', 'REPARACION', 'ADELANTO'];
  const opcionesFormaPago = ['EFECTIVO', 'TRANSFERENCIA'];

  // Validar formato de monto (números con hasta 2 decimales)
  const validarMonto = (value) => {
    return /^\d*\.?\d{0,2}$/.test(value) || value === '';
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si es campo de monto, validar que sea un número decimal válido
    if (name === 'monto') {
      if (validarMonto(value)) {
        setField(name, value);
      }
    } else {
      setField(name, value);
    }
  };

  // Verificar si el formulario está completo
  const esFormularioValido = () => {
    return formData.descripcion && formData.monto && formData.formaPago;
  };

  // Verificar si hay datos que se perderían al salir
  const hayDatosNoGuardados = () => {
    return formData.descripcion || 
           formData.monto || 
           formData.formaPago || 
           formData.observaciones || 
           formData.comprobante;
  };

  return {
    formData,
    opcionesDescripcion,
    opcionesFormaPago,
    handleInputChange,
    esFormularioValido,
    hayDatosNoGuardados
  };
}