// components/gastos/BotonAccionesGasto.jsx

export function BotonAccionesGasto({
  onRegistrarGasto,
  onLimpiarFormulario,
  onVolverMenu,
  loading,
  disabled
}) {
  return (
    <div className="bg-gray-50 px-6 py-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Botones secundarios */}
        <div className="flex flex-col sm:flex-row gap-2 order-2 sm:order-1">
          <button 
            type="button"
            onClick={onLimpiarFormulario}
            disabled={loading}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            Limpiar Formulario
          </button>
          
          <button 
            type="button"
            onClick={onVolverMenu}
            disabled={loading}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            Volver al Menú
          </button>
        </div>
        
        {/* Botón principal */}
        <div className="order-1 sm:order-2">
          <button 
            type="button"
            onClick={onRegistrarGasto}
            disabled={disabled || loading}
            className={`w-full sm:w-auto px-6 py-2 rounded font-semibold transition-colors ${
              disabled || loading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </div>
            ) : disabled ? (
              'Complete los campos obligatorios'
            ) : (
              'Registrar Gasto'
            )}
          </button>
        </div>
      </div>
      
      {/* Información adicional */}
      <div className="mt-3 text-xs text-gray-600 text-center">
        <p>
          El gasto se registrará con fecha y hora actual. 
          {disabled && ' Complete todos los campos marcados con * para continuar.'}
        </p>
      </div>
    </div>
  );
}