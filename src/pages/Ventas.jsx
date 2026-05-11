import React, { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart,
  User,
  Package,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  ClipboardCheck,
  DollarSign,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Ventas = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [clienteFilter, setClienteFilter] = useState('');
  const [productoFilter, setProductoFilter] = useState('');

  // Estado de la venta actual
  const [clienteId, setClienteId] = useState('');
  const [lineasCompra, setLineasCompra] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.openNew === 'venta') {
      resetVenta();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const resetVenta = () => {
    setClienteId('');
    setLineasCompra([]);
    setStep(1);
    setError(null);
    setSuccess(false);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resCli, resProd] = await Promise.all([
        api.get('/cliente'),
        api.get('/producto'),
      ]);
      setClientes(resCli.data.items || (Array.isArray(resCli.data) ? resCli.data : []));
      setProductos(resProd.data.items || (Array.isArray(resProd.data) ? resProd.data : []));
      setError(null);
    } catch (err) {
      console.error('Error cargando datos para ventas:', err);
      setError('Error al cargar clientes o productos.');
    } finally {
      setLoading(false);
    }
  };

  const agregarLinea = () => {
    setLineasCompra([...lineasCompra, { productoId: '', cantidad: 1, precioUnitario: 0 }]);
  };

  const eliminarLinea = (index) => {
    setLineasCompra(lineasCompra.filter((_, i) => i !== index));
  };

  const actualizarLinea = (index, campo, valor) => {
    const nuevasLineas = [...lineasCompra];
    nuevasLineas[index][campo] = valor;

    if (campo === 'productoId') {
      const prod = productos.find((p) => p.id === parseInt(valor));
      if (prod) {
        nuevasLineas[index].precioUnitario = prod.precioVenta;
      }
    }

    setLineasCompra(nuevasLineas);
  };

  const calcularTotal = () => {
    return lineasCompra.reduce((acc, curr) => acc + curr.cantidad * curr.precioUnitario, 0);
  };

  const canContinueStep1 = clienteId !== '';
  const canContinueStep2 =
    lineasCompra.length > 0 &&
    !lineasCompra.some((l) => !l.productoId || l.cantidad <= 0 || l.precioUnitario <= 0);

  const goNext = () => {
    if (step === 1 && !canContinueStep1) {
      setError('Selecciona un cliente para continuar.');
      return;
    }
    if (step === 2 && !canContinueStep2) {
      setError('Completa todas las líneas con producto, cantidad y precio.');
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const goBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canContinueStep1 || !canContinueStep2) {
      setError('Revisa los datos antes de finalizar la venta.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const ventaData = {
        clienteId: parseInt(clienteId),
        fechaVenta: new Date().toISOString(),
        total: calcularTotal(),
        lineasCompra: lineasCompra.map((l) => ({
          productoId: parseInt(l.productoId),
          cantidad: parseInt(l.cantidad),
          precioUnitario: parseFloat(l.precioUnitario),
        })),
      };

      const response = await api.post('/venta', ventaData);

      if (response.data.ok) {
        setSuccess(true);
        setLineasCompra([]);
        setClienteId('');
        setStep(1);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error al procesar venta:', err);
      setError(err.response?.data?.mensaje || 'Error al procesar la venta. Comprueba el stock disponible.');
    } finally {
      setSubmitting(false);
    }
  };

  const clientesFiltrados = useMemo(() => {
    const q = clienteFilter.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) =>
      `${c.nombre} ${c.contacto} ${c.direccion}`.toLowerCase().includes(q)
    );
  }, [clientes, clienteFilter]);

  const productosFiltrados = useMemo(() => {
    const q = productoFilter.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter((p) =>
      `${p.nombre} ${p.categoria} ${p.descripcion}`.toLowerCase().includes(q)
    );
  }, [productos, productoFilter]);

  const clienteSeleccionado = clientes.find((c) => c.id === parseInt(clienteId));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl font-semibold text-gray-500">
        Cargando módulo de ventas...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-800">Nueva Venta</h2>
            <p className="text-gray-500 font-medium">Flujo guiado para facturar sin errores.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetVenta}
          className="text-sm font-bold text-gray-400 hover:text-gray-600"
        >
          Reiniciar
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          {[
            { id: 1, label: 'Cliente' },
            { id: 2, label: 'Productos' },
            { id: 3, label: 'Resumen' },
          ].map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                  step >= item.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {item.id}
              </div>
              <span className={`font-bold ${step >= item.id ? 'text-gray-800' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {item.id < 3 && <div className="w-12 h-0.5 bg-gray-100" />}
            </div>
          ))}
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center shadow-sm rounded-xl">
          <CheckCircle className="text-green-500 mr-3" />
          <p className="text-green-700 font-medium">Venta procesada con éxito. El stock se actualizó automáticamente.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start shadow-sm rounded-xl">
          <AlertCircle className="text-red-500 mr-3 mt-0.5" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-800 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Selecciona un cliente
              </h3>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Paso 1 de 3
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
              <input
                type="text"
                placeholder="Buscar por nombre, contacto o dirección"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-semibold"
                value={clienteFilter}
                onChange={(e) => setClienteFilter(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientesFiltrados.map((cliente) => (
                <button
                  type="button"
                  key={cliente.id}
                  onClick={() => setClienteId(cliente.id.toString())}
                  className={`p-5 rounded-2xl border transition-all text-left ${
                    clienteId === cliente.id.toString()
                      ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100'
                      : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg'
                  }`}
                >
                  <p className="font-black text-gray-800">{cliente.nombre}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-1">{cliente.contacto}</p>
                  <p className="text-xs text-gray-300 font-semibold mt-1">{cliente.direccion}</p>
                </button>
              ))}
            </div>

            {clientesFiltrados.length === 0 && (
              <div className="text-center text-gray-400 font-semibold py-10">
                No se encontraron clientes con ese criterio.
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Añade productos
              </h3>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Paso 2 de 3
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o categoría"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-semibold"
                  value={productoFilter}
                  onChange={(e) => setProductoFilter(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={agregarLinea}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100"
              >
                <Plus className="w-5 h-5 mr-2" />
                Añadir línea
              </button>
            </div>

            <div className="space-y-4">
              {lineasCompra.length === 0 ? (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                  No hay productos en esta venta. Usa “Añadir línea” para comenzar.
                </div>
              ) : (
                lineasCompra.map((linea, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-2xl group transition-colors hover:bg-gray-100/60"
                  >
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">
                        Producto
                      </label>
                      <select
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={linea.productoId}
                        onChange={(e) => actualizarLinea(index, 'productoId', e.target.value)}
                        required
                      >
                        <option value="">Selecciona...</option>
                        {productosFiltrados.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} - ${p.precioVenta}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">
                        Cant.
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={linea.cantidad}
                        onChange={(e) => actualizarLinea(index, 'cantidad', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">
                        Precio
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={linea.precioUnitario}
                          onChange={(e) => actualizarLinea(index, 'precioUnitario', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => eliminarLinea(index)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Eliminar línea"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-800 flex items-center">
                <ClipboardCheck className="w-5 h-5 mr-2 text-blue-600" />
                Revisa y confirma
              </h3>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Paso 3 de 3
              </span>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Cliente</p>
              <p className="text-xl font-black text-gray-800 mt-2">
                {clienteSeleccionado?.nombre || 'Cliente no seleccionado'}
              </p>
              <p className="text-sm text-gray-500 font-semibold">{clienteSeleccionado?.contacto}</p>
            </div>

            <div className="space-y-3">
              {lineasCompra.map((linea, index) => {
                const producto = productos.find((p) => p.id === parseInt(linea.productoId));
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div>
                      <p className="font-black text-gray-800">{producto?.nombre || 'Producto'}</p>
                      <p className="text-xs text-gray-400 font-semibold">
                        {linea.cantidad} x ${linea.precioUnitario}
                      </p>
                    </div>
                    <p className="font-black text-gray-800">
                      ${(linea.cantidad * linea.precioUnitario).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <div className="flex items-center text-gray-400 font-bold">
                <DollarSign className="w-5 h-5 mr-2" />
                Total de la venta
              </div>
              <p className="text-3xl font-black text-gray-900">
                ${calcularTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="flex items-center text-gray-500 font-bold disabled:text-gray-300"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Atrás
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-blue-100"
            >
              Continuar
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center disabled:bg-gray-400 disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Procesando Venta...
                </>
              ) : (
                'Finalizar y Registrar Venta'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Ventas;
