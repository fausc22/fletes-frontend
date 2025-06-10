import { useGasto } from '../../context/GastosContext';
import { toast } from 'react-hot-toast';

export function useArchivoGasto() {
  const { fileName, setArchivo, clearArchivo } = useGasto();

  // Tipos de archivo válidos
  const tiposValidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  // Manejar carga de archivos
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (tiposValidos.includes(file.type)) {
        // Validar tamaño (máx 10MB)
        if (file.size <= 10 * 1024 * 1024) {
          setArchivo(file, file.name);
        } else {
          toast.error('El archivo no debe superar los 10MB');
          e.target.value = null;
        }
      } else {
        toast.error('El archivo debe ser un PDF o una imagen (JPG, PNG)');
        e.target.value = null;
      }
    }
  };

  // Eliminar archivo seleccionado
  const removeFile = () => {
    clearArchivo();
  };

  return {
    fileName,
    handleFileChange,
    removeFile
  };
}