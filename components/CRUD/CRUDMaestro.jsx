import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

// Hooks
import { useEntityCRUD, useFormMode } from '../../hooks/useCRUD';
import { useEmpleados } from '../../hooks/useEmpleados';
import { useDynamicOptions } from '../../hooks/useDynamicOptions'; // ← NUEVO HOOK

// Componentes
import { LayoutCRUD } from './LayoutCRUD';
import { PanelLateralCRUD } from './PanelLateralCRUD';
import FormularioGenerico from './FormGenerico';
import { ModalBusquedaGenerica } from './ModalBusquedaGenerica';

export default function CRUDMaestro({ config }) {
  useAuth();

  // Hook para opciones dinámicas (categorías, etc.)
  const { config: dynamicConfig, loading: optionsLoading } = useDynamicOptions(config);
  
  // Usar la configuración dinámica en lugar de la original
  const activeConfig = dynamicConfig;

  // Detectar si es empleado
  const isEmpleado = activeConfig.entityName === 'empleado';
  
  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Hooks para manejar el estado
  const { selectedOption, setMode } = useFormMode();
  
  // Hook de empleados (solo si es empleado)
  const empleadosHook = isEmpleado ? useEmpleados() : null;
  
  // Hook genérico (solo si NO es empleado) - usar configuración dinámica
  const genericHook = !isEmpleado ? useEntityCRUD(activeConfig) : null;

  // USAR EL ESTADO DEL HOOK EN LUGAR DE ESTADO LOCAL
  const formData = isEmpleado ? (empleadosHook?.formData || {}) : (genericHook?.formData || {});
  const setFormData = isEmpleado ? empleadosHook?.setFormData : genericHook?.setFormData;
  const errors = isEmpleado ? {} : (genericHook?.errors || {});

  // Funciones unificadas que funcionan para ambos hooks
  const loading = isEmpleado ? empleadosHook?.loading : genericHook?.loading;
  const user = isEmpleado ? empleadosHook?.user : genericHook?.user;

  // Manejo de cambios en inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    console.log(`📝 Cambio en campo ${name}:`, value);
    
    // Validaciones en tiempo real (permisivas)
    if (activeConfig.liveValidations && activeConfig.liveValidations[name]) {
      if (!activeConfig.liveValidations[name](value)) {
        return;
      }
    }
    
    if (isEmpleado) {
      // Para empleados, usar su lógica
      empleadosHook?.setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      // Para otros, usar el hook genérico
      genericHook?.handleInputChange(event);
    }
  };

  // Validación del formulario
  const validateForm = () => {
    if (isEmpleado) {
      // Usar validaciones de empleados
      const errores = empleadosHook.validarDatosEmpleado(formData, !!formData.id);
      return errores.length === 0;
    } else {
      // Usar validaciones del hook genérico
      return genericHook?.validateForm() || false;
    }
  };

  // Resetear formulario
  const resetForm = () => {
    if (isEmpleado) {
      empleadosHook?.setFormData(activeConfig.initialData);
    } else {
      genericHook?.resetForm();
    }
  };

  // Guardar entidad
  const saveEntity = async () => {
    try {
      let result;
      
      if (isEmpleado) {
        // Usar hook de empleados
        if (formData.id) {
          result = await empleadosHook.actualizarEmpleado(formData);
        } else {
          result = await empleadosHook.crearEmpleado(formData);
        }
        
        if (result.success) {
          resetForm();
          return true;
        } else {
          return false;
        }
      } else {
        // Usar hook genérico - EL HOOK MANEJA TODA LA VALIDACIÓN
        console.log('💾 Guardando con datos:', formData);
        return await genericHook.saveEntity();
      }
    } catch (error) {
      console.error('Error en saveEntity:', error);
      toast.error('Error inesperado al guardar');
      return false;
    }
  };

  // Búsqueda unificada
  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      toast.error('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    setSearchLoading(true);
    try {
      let results = [];
      
      if (isEmpleado) {
        // Usar búsqueda de empleados
        results = await empleadosHook.buscarEmpleados(searchQuery);
      } else {
        // Usar búsqueda genérica con axios
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        };
        
        const response = await axios.get(
          `${activeConfig.searchConfig.searchEndpoint}?search=${encodeURIComponent(searchQuery)}`,
          { headers }
        );
        results = response.data.data || response.data;
      }
      
      setSearchResults(results);
      setModalIsOpen(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast.error(`Error al buscar ${activeConfig.entityName}s`);
    } finally {
      setSearchLoading(false);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setModalIsOpen(false);
  };

  // Manejar click en resultado
  const handleResultClick = (item, onSelect) => {
    onSelect(item);
    clearSearch();
  };

  // Handlers
  const handleModeSelect = (mode) => {
    setMode(mode);
    resetForm();
    clearSearch();
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleResultSelect = (item) => {
    // Mapear el item seleccionado al formato del formulario
    const mappedData = { ...activeConfig.initialData };
        
    // Copiar todos los campos que coincidan
    Object.keys(activeConfig.initialData).forEach(key => {
      if (item[key] !== undefined) {
        mappedData[key] = item[key];
      }
    });
        
    // Asegurar que se incluya el ID para edición
    mappedData.id = item.id;
        
    if (isEmpleado) {
      empleadosHook?.setFormData(mappedData);
    } else {
      genericHook?.setFormData(mappedData);
    }
  };

  const handleSave = async () => {
    const success = await saveEntity();
    if (success) {
      toast.success('Operación completada exitosamente');
    }
  };

  // Verificación de acceso para empleados
  const canAccess = () => {
    if (isEmpleado && user && user.rol !== 'GERENTE') {
      return false;
    }
    return true;
  };

  // Si es empleado y no tiene permisos, mostrar mensaje de acceso restringido
  if (isEmpleado && !canAccess()) {
    return (
      <LayoutCRUD 
        title={activeConfig.title}
        descripcion={`Gestión de ${activeConfig.entityName}s VERTIMAR`}
      >
        <div className="w-full p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">
            Solo los gerentes pueden gestionar empleados.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Tu rol actual: {user?.rol || 'No definido'}
          </p>
        </div>
      </LayoutCRUD>
    );
  }

  // Mostrar loading mientras se cargan las opciones dinámicas
  if (optionsLoading && activeConfig.entityName === 'producto') {
    return (
      <LayoutCRUD 
        title={activeConfig.title}
        descripcion={`Gestión de ${activeConfig.entityName}s VERTIMAR`}
      >
        <div className="w-full p-8 text-center">
          <p className="text-gray-600">Cargando categorías...</p>
        </div>
      </LayoutCRUD>
    );
  }

  return (
    <LayoutCRUD 
      title={activeConfig.title}
      descripcion={`Gestión de ${activeConfig.entityName}s VERTIMAR`}
    >
      <PanelLateralCRUD 
        config={activeConfig}
        onModeSelect={handleModeSelect}
      />
            
      {/* Panel derecho - formulario */}
      <div className={`w-full md:w-2/3 p-8 ${selectedOption ? 'block' : 'hidden md:block'}`}>
        {selectedOption && (
          <FormularioGenerico
            config={activeConfig}
            formData={formData}
            mode={selectedOption}
            errors={errors}
            onInputChange={handleInputChange}
            onSave={handleSave}
            onReset={resetForm}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchQueryChange}
            loading={loading}
          >
            <ModalBusquedaGenerica
              mostrar={modalIsOpen}
              titulo={`Seleccionar ${activeConfig.entityName.charAt(0).toUpperCase() + activeConfig.entityName.slice(1)}`}
              resultados={searchResults}
              onSeleccionar={(item) => handleResultClick(item, handleResultSelect)}
              onCerrar={() => setModalIsOpen(false)}
              loading={searchLoading}
              displayField="nombre"
            />
          </FormularioGenerico>
        )}
      </div>
    </LayoutCRUD>
  );
}