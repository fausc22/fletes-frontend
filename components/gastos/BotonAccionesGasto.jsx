export function BotonAccionesGasto({ 
  onRegistrarGasto,
  onLimpiarFormulario,
  onVolverMenu,
  loading = false,
  disabled = false
}) {
  return (
    <div className="flex flex-wrap justify-between gap-4 mt-8 px-6 pb-6">
      <button 
        onClick={onRegistrarGasto}
        disabled={loading || disabled}
        className={`font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline min-w-[120px] ${
          loading || disabled
            ? "bg-gray-500 cursor-not-allowed text-white" 
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            PROCESANDO...
          </div>
        ) : (
          "REGISTRAR GASTO"
        )}
      </button>
      
      <div className="flex gap-4">
        <button 
          onClick={onLimpiarFormulario}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          LIMPIAR FORMULARIO
        </button>
        
        <button 
          onClick={onVolverMenu}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          VOLVER AL MENÚ
        </button>
      </div>
    </div>
  );
}