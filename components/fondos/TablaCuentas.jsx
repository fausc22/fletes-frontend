// components/fondos/TablaCuentas.jsx
import { MdArrowDownward, MdArrowUpward, MdSwapHoriz, MdHistory } from "react-icons/md";

// Formateador de moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
};

function TablaEscritorio({ 
  cuentas, 
  totalSaldos, 
  onIngreso, 
  onEgreso, 
  onTransferencia, 
  onVerDetalle 
}) {
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-right">Saldo</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cuentas.length > 0 ? (
            cuentas.map((cuenta) => (
              <tr key={cuenta.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{cuenta.id}</td>
                <td className="p-3 font-medium">{cuenta.nombre}</td>
                <td className={`p-3 text-right font-semibold ${
                  parseFloat(cuenta.saldo) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(cuenta.saldo)}
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => onIngreso(cuenta.id)}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                      title="Registrar Ingreso"
                    >
                      <MdArrowDownward />
                    </button>
                    <button 
                      onClick={() => onEgreso(cuenta.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                      title="Registrar Egreso"
                    >
                      <MdArrowUpward />
                    </button>
                    <button 
                      onClick={() => onTransferencia(cuenta.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                      title="Realizar Transferencia"
                    >
                      <MdSwapHoriz />
                    </button>
                    <button 
                      onClick={() => onVerDetalle(cuenta)}
                      className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded"
                      title="Ver Historial"
                    >
                      <MdHistory />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No hay cuentas registradas
              </td>
            </tr>
          )}
        </tbody>
        <tfoot className="bg-gray-100">
          <tr>
            <td colSpan="2" className="p-3 text-right font-bold">Total:</td>
            <td className={`p-3 text-right font-bold ${
              totalSaldos >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totalSaldos)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TarjetasMoviles({ 
  cuentas, 
  onIngreso, 
  onEgreso, 
  onTransferencia, 
  onVerDetalle 
}) {
  return (
    <div className="md:hidden space-y-4">
      {cuentas.length > 0 ? (
        cuentas.map((cuenta) => (
          <div key={cuenta.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold">{cuenta.nombre}</h3>
                <p className="text-sm text-gray-600">ID: {cuenta.id}</p>
              </div>
              <div className={`text-right font-bold ${
                parseFloat(cuenta.saldo) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(cuenta.saldo)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onIngreso(cuenta.id)}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded flex items-center justify-center text-sm"
              >
                <MdArrowDownward className="mr-1" /> Ingreso
              </button>
              <button 
                onClick={() => onEgreso(cuenta.id)}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center justify-center text-sm"
              >
                <MdArrowUpward className="mr-1" /> Egreso
              </button>
              <button 
                onClick={() => onTransferencia(cuenta.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded flex items-center justify-center text-sm"
              >
                <MdSwapHoriz className="mr-1" /> Transferir
              </button>
              <button 
                onClick={() => onVerDetalle(cuenta)}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded flex items-center justify-center text-sm"
              >
                <MdHistory className="mr-1" /> Historial
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white p-4 rounded shadow text-center text-gray-500">
          No hay cuentas registradas
        </div>
      )}
    </div>
  );
}

export default function TablaCuentas({ 
  cuentas, 
  totalSaldos, 
  loading = false,
  onIngreso, 
  onEgreso, 
  onTransferencia, 
  onVerDetalle 
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Cargando cuentas...</span>
      </div>
    );
  }

  return (
    <>
      <TablaEscritorio
        cuentas={cuentas}
        totalSaldos={totalSaldos}
        onIngreso={onIngreso}
        onEgreso={onEgreso}
        onTransferencia={onTransferencia}
        onVerDetalle={onVerDetalle}
      />
      
      <TarjetasMoviles
        cuentas={cuentas}
        onIngreso={onIngreso}
        onEgreso={onEgreso}
        onTransferencia={onTransferencia}
        onVerDetalle={onVerDetalle}
      />
    </>
  );
}