// context/GastosContext.jsx
import { createContext, useContext, useReducer } from 'react';

// Estado inicial
const initialState = {
  descripcion: '',
  monto: '',
  formaPago: '',
  observaciones: ''
};

// Tipos de acciones
const actionTypes = {
  SET_FIELD: 'SET_FIELD',
  RESET_FORM: 'RESET_FORM',
  SET_FORM_DATA: 'SET_FORM_DATA'
};

// Reducer
const gastosReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_FIELD:
      return {
        ...state,
        [action.field]: action.value
      };
    
    case actionTypes.RESET_FORM:
      return { ...initialState };
    
    case actionTypes.SET_FORM_DATA:
      return {
        ...state,
        ...action.data
      };
    
    default:
      return state;
  }
};

// Contexto
const GastoContext = createContext();

// Provider
export const GastoProvider = ({ children }) => {
  const [formData, dispatch] = useReducer(gastosReducer, initialState);

  // Funciones del contexto
  const setField = (field, value) => {
    dispatch({
      type: actionTypes.SET_FIELD,
      field,
      value
    });
  };

  const resetForm = () => {
    dispatch({
      type: actionTypes.RESET_FORM
    });
  };

  const setFormData = (data) => {
    dispatch({
      type: actionTypes.SET_FORM_DATA,
      data
    });
  };

  // Funciones de utilidad para monto (hasta 8 dígitos)
  const formatMonto = (value) => {
    // Si está vacío, devolver vacío
    if (!value) return '';
    
    // Convertir a string y remover todo excepto números
    let numericString = value.toString().replace(/[^\d]/g, '');
    
    // Si está vacío después de limpiar, devolver vacío
    if (!numericString) return '';
    
    // Limitar a 10 dígitos máximo (8 enteros + 2 decimales)
    if (numericString.length > 10) {
      numericString = numericString.substring(0, 10);
    }
    
    // Convertir a número para trabajar con él
    let numero = parseInt(numericString, 10);
    
    // Verificar que esté en el rango válido
    if (numero > 9999999999) { // 99.999.999,99 sin separadores
      numero = 9999999999;
      numericString = numero.toString();
    }
    
    // Si tiene más de 2 dígitos, agregar decimales
    let formattedValue;
    if (numericString.length > 2) {
      const enteros = numericString.slice(0, -2);
      const decimales = numericString.slice(-2);
      
      // Formatear la parte entera con puntos como separadores de miles
      const enterosFormateados = parseInt(enteros, 10).toLocaleString('es-AR');
      formattedValue = `${enterosFormateados},${decimales}`;
    } else if (numericString.length === 2) {
      formattedValue = `0,${numericString}`;
    } else if (numericString.length === 1) {
      formattedValue = `0,0${numericString}`;
    } else {
      formattedValue = '';
    }
    
    return formattedValue;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Campo ${name} cambiado a:`, value);
    
    if (name === 'monto') {
      // Solo formatear si hay contenido
      if (value === '') {
        setField(name, '');
      } else {
        const formattedValue = formatMonto(value);
        setField(name, formattedValue);
      }
    } else {
      setField(name, value);
    }
  };

  // Validaciones
  const isValidForm = () => {
    const requiredFields = ['descripcion', 'monto', 'formaPago'];
    return requiredFields.every(field => {
      const value = formData[field];
      if (field === 'monto') {
        return value && getMontoNumerico() > 0;
      }
      return value && (value || '').toString().trim() !== '';
    });
  };

  const hasUnsavedData = () => {
    return Object.values(formData).some(value => 
      value && (value || '').toString().trim() !== ''
    );
  };

  // Obtener monto como número (remover formato)
  const getMontoNumerico = () => {
    if (!formData.monto) return 0;
    
    // Remover puntos (separadores de miles) y cambiar coma por punto decimal
    const cleanValue = formData.monto
      .replace(/\./g, '') // Remover puntos
      .replace(',', '.'); // Cambiar coma por punto
    
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Preparar datos para envío al backend
  const prepararDatosParaBackend = () => {
    return {
      descripcion: (formData.descripcion || '').trim(),
      monto: getMontoNumerico(),
      forma_pago: (formData.formaPago || '').trim(),
      observaciones: formData.observaciones ? (formData.observaciones || '').trim() : null
    };
  };

  // Función para establecer monto desde número
  const setMontoDesdeNumero = (numero) => {
    if (typeof numero === 'number' && numero >= 0) {
      // Convertir a centavos para trabajar con enteros
      const centavos = Math.round(numero * 100);
      const formattedValue = formatMonto(centavos.toString());
      setField('monto', formattedValue);
    }
  };

  const value = {
    // Estado
    formData,
    
    // Funciones de manipulación
    setField,
    resetForm,
    setFormData,
    handleInputChange,
    setMontoDesdeNumero,
    
    // Utilidades
    formatMonto,
    isValidForm,
    hasUnsavedData,
    getMontoNumerico,
    prepararDatosParaBackend
  };

  return (
    <GastoContext.Provider value={value}>
      {children}
    </GastoContext.Provider>
  );
};

// Hook para usar el contexto
export const useGasto = () => {
  const context = useContext(GastoContext);
  
  if (!context) {
    throw new Error('useGasto debe ser usado dentro de un GastoProvider');
  }
  
  return context;
};