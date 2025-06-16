
import { useEffect } from 'react';
import { MdRemoveRedEye, MdCloudUpload, MdDelete } from "react-icons/md";
import { useComprobantes } from '../../hooks/useComprobantes';

export default function ModalGestionComprobante({
  mostrar,
  onCerrar,
  id,
  tipo,
  titulo = "Gestión de Comprobante"
}) {
  const {
    comprobante,
    comprobantePreview,
    comprobanteExistente,
    uploadingComprobante,
    verificandoComprobante,
    handleFileChange,
    verificarComprobante,
    subirComprobante,
    verComprobante,
    eliminarComprobante,
    limpiarEstados,
    getArchivoInfo
  } = useComprobantes();

  // Verificar comprobante existente al abrir el modal
  useEffect(() => {
    if (mostrar && id && tipo) {
      verificarComprobante(id, tipo);
    }
  }, [mostrar, id, tipo]);

  // Limpiar estados al cerrar el modal
  useEffect(() => {
    if (!mostrar) {
      limpiarEstados();
    }
  }, [mostrar]);

  if (!mostrar) return null;

  const archivoInfo = getArchivoInfo();

  const handleSubir = async () => {
    const exito = await subirComprobante(id, tipo);
    if (exito) {
      setTimeout(onCerrar, 1500);
    }
  };

  const handleVer = () => {
    verComprobante(id, tipo);
  };

  const handleEliminar = async () => {
    const exito = await eliminarComprobante(id, tipo);
    if (exito) {
      onCerrar();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">{titulo}</h2>
        
        <div className="text-center mb-4">
          <p className="text-gray-700">
            {tipo === 'compra' ? 'Compra' : tipo === 'gasto' ? 'Gasto' : 'Venta'} #{id}
          </p>
        </div>
        
        {/* Estado del comprobante existente */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          {verificandoComprobante ? (
            <div className="text-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
              <p className="text-gray-600">Verificando comprobante...</p>
            </div>
          ) : comprobanteExistente ? (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MdRemoveRedEye size={36} className="text-blue-600" />
              </div>
              <p className="mb-4 text-green-700 font-medium">
                Este {tipo} ya tiene un comprobante cargado.
              </p>
              <div className="flex gap-2 justify-center mb-4 flex-wrap">
                <button 
                  onClick={handleVer}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <MdRemoveRedEye size={16} />
                  Ver Comprobante
                </button>
                <button 
                  onClick={handleEliminar}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <MdDelete size={16} />
                  Eliminar
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Si necesitas reemplazar el comprobante, selecciona un nuevo archivo.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MdCloudUpload size={48} className="text-blue-600" />
              </div>
              <p className="mb-4">
                No hay ningún comprobante cargado para este {tipo}.
              </p>
            </div>
          )}
        </div>
        
        {/* Selector de archivo */}
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg bg-white text-center hover:bg-gray-50 transition-colors cursor-pointer mb-6">
          <input 
            type="file"
            id="comprobante-modal-input"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <label 
            htmlFor="comprobante-modal-input"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <span className="text-blue-600 hover:text-blue-800 font-medium mb-2">
              Haz clic aquí para seleccionar un archivo
            </span>
            <span className="text-xs text-gray-500">
              Formatos aceptados: PDF, JPG, JPEG, PNG, DOC, DOCX (Máx. 10MB)
            </span>
          </label>
          
          {/* Información del archivo seleccionado */}
          {comprobante && archivoInfo && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {/* Preview del archivo */}
                <div className="flex-shrink-0">
                  {archivoInfo.preview ? (
                    <img 
                      src={archivoInfo.preview} 
                      alt="Vista previa" 
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Info del archivo */}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-blue-900 truncate">
                    {archivoInfo.nombre}
                  </p>
                  <p className="text-xs text-blue-700">
                    {archivoInfo.tamaño}
                  </p>
                </div>
                
                {/* Icono de check */}
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
          <button 
            onClick={onCerrar}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded order-2 sm:order-1"
          >
            Cancelar
          </button>
          
          <button 
            onClick={handleSubir}
            disabled={!comprobante || uploadingComprobante}
            className={`px-4 py-2 rounded text-white order-1 sm:order-2 ${
              !comprobante || uploadingComprobante 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {uploadingComprobante ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subiendo...
              </div>
            ) : (
              comprobanteExistente ? "Reemplazar Comprobante" : "Subir Comprobante"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}