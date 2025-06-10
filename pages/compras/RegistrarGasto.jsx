import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { GastoProvider, useGasto } from '../../context/GastosContext';
import { useRegistrarGasto } from '../../hooks/gastos/useRegistrarGasto';
import { useFormularioGasto } from '../../hooks/gastos/useFormularioGasto';

import FormularioGasto from '../../components/gastos/FormularioGasto';
import SelectorArchivosGasto from '../../components/gastos/SelectorArchivosGasto';
import { ModalConfirmacionGasto, ModalConfirmacionSalidaGasto } from '../../components/gastos/ModalesConfirmacionGasto';
import { BotonAccionesGasto } from '../../components/gastos/BotonAccionesGasto';

function RegistrarGastoContent() {
  const { formData, resetForm } = useGasto();
  const { registrarGasto, loading } = useRegistrarGasto();
  const { esFormularioValido, hayDatosNoGuardados } = useFormularioGasto();
  
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  useAuth();

  const handleConfirmarGasto = () => {
    if (!esFormularioValido()) {
      toast.error('Por favor complete los campos obligatorios: Descripción, Monto y Forma de Pago');
      return;
    }
    
    setMostrarConfirmacion(true);
  };

  const handleRegistrarGasto = async () => {
    const exito = await registrarGasto(formData);
    if (exito) {
      resetForm();
      setMostrarConfirmacion(false);
    }
  };

  const handleLimpiarFormulario = () => {
    resetForm();
    toast.success('Formulario limpiado');
  };

  const handleConfirmarSalida = () => {
    if (hayDatosNoGuardados()) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Registrar Gasto</title>
        <meta name="description" content="Registro de gastos VERTIMAR" />
      </Head>
      
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Encabezado */}
        <div className="bg-blue-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">REGISTRAR GASTO</h1>
          <p className="text-blue-200 mt-2">Complete el formulario para registrar un nuevo gasto</p>
        </div>
        
        {/* Formulario */}
        <FormularioGasto />
        
        {/* Selector de archivos */}
        <SelectorArchivosGasto />
        
        {/* Botones de acción */}
        <BotonAccionesGasto
          onRegistrarGasto={handleConfirmarGasto}
          onLimpiarFormulario={handleLimpiarFormulario}
          onVolverMenu={handleConfirmarSalida}
          loading={loading}
          disabled={!esFormularioValido()}
        />
      </div>
      
      {/* Modal de confirmación de gasto */}
      <ModalConfirmacionGasto
        mostrar={mostrarConfirmacion}
        descripcion={formData.descripcion}
        monto={formData.monto}
        formaPago={formData.formaPago}
        onConfirmar={handleRegistrarGasto}
        onCancelar={() => setMostrarConfirmacion(false)}
        loading={loading}
      />
      
      {/* Modal de confirmación de salida */}
      <ModalConfirmacionSalidaGasto
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function RegistrarGasto() {
  return (
    <GastoProvider>
      <RegistrarGastoContent />
    </GastoProvider>
  );
}