import { createContext, useContext, useReducer } from 'react';

const GastoContext = createContext();

// Reducer para manejar el estado del gasto
function gastoReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { 
        ...state, 
        formData: { 
          ...state.formData, 
          [action.payload.name]: action.payload.value 
        } 
      };
    
    case 'SET_ARCHIVO':
      return {
        ...state,
        formData: { ...state.formData, comprobante: action.payload.file },
        fileName: action.payload.fileName
      };
    
    case 'CLEAR_ARCHIVO':
      return {
        ...state,
        formData: { ...state.formData, comprobante: null },
        fileName: ''
      };
    
    case 'RESET_FORM':
      return {
        ...state,
        formData: {
          descripcion: '',
          monto: '',
          formaPago: '',
          observaciones: '',
          comprobante: null
        },
        fileName: ''
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
}

const initialState = {
  formData: {
    descripcion: '',
    monto: '',
    formaPago: '',
    observaciones: '',
    comprobante: null
  },
  fileName: '',
  loading: false
};

export function GastoProvider({ children }) {
  const [state, dispatch] = useReducer(gastoReducer, initialState);

  const actions = {
    setField: (name, value) => dispatch({ type: 'SET_FIELD', payload: { name, value } }),
    setArchivo: (file, fileName) => dispatch({ type: 'SET_ARCHIVO', payload: { file, fileName } }),
    clearArchivo: () => dispatch({ type: 'CLEAR_ARCHIVO' }),
    resetForm: () => dispatch({ type: 'RESET_FORM' }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading })
  };

  return (
    <GastoContext.Provider value={{ ...state, ...actions }}>
      {children}
    </GastoContext.Provider>
  );
}

export function useGasto() {
  const context = useContext(GastoContext);
  if (!context) {
    throw new Error('useGasto debe ser usado dentro de GastoProvider');
  }
  return context;
}