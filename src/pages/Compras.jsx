import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, Package, Plus, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Compras = () => {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Estado del pedido actual
  const [proveedorId, setProveedorId] = useState('');
  const [detalles, setDetalles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.openNew === 'compra') {
      resetCompra();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const resetCompra = () => {
    setProveedorId('');
    setDetalles([]);
    setError(null);
    setSuccess(false);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProv, resProd] = await Promise.all([
        api.get('/proveedor'),
        api.get('/producto')
      ]);
      setProveedores(resProv.data.items || []);
      setProductos(resProd.data.items || []);
      setError(null);
    } catch (err) {
      console.error("Error cargando datos para compras:", err);
      setError("Error al cargar proveedores o productos.");
    } finally {
      setLoading(false);
    }
  };

  const agregarLinea = () => {
    setDetalles([...detalles, { productoId: '', cantidad: 1, precioUnitario: 0 }]);
  };

  const eliminarLinea = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarLinea = (index, campo, valor) => {
    const nuevasLineas = [...detalles];
    nuevasLineas[index][campo] = valor;

    if (campo === 'productoId') {
      const prod = productos.find(p => p.id === parseInt(valor));
      if (prod) {
        nuevasLineas[index].precioUnitario = prod.precioCompra; // Precio de compra sugerido
      }
    }

    setDetalles(nuevasLineas);
  };

  const calcularTotal = () => {
    return detalles.reduce((acc, curr) => acc + (curr.cantidad * curr.precioUnitario), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proveedorId || detalles.length === 0) {
      setError("Debes seleccionar un proveedor y al menos un producto.");
      return;
    }

    if (detalles.some(l => !l.productoId || l.cantidad <= 0)) {
      setError("Completa todos los campos de producto y cantidad.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const pedidoData = {
        proveedorId: parseInt(proveedorId),
        fechaPedido: new Date().toISOString(),
        detalles: detalles.map(l => ({
          productoId: parseInt(l.productoId),
          cantidad: parseInt(l.cantidad),
          precioUnitario: parseFloat(l.precioUnitario)
        }))
      };

      const response = await api.post('/pedidocompra', pedidoData);
      
      if (response.data.ok) {
        setSuccess(true);
        setDetalles([]);
        setProveedorId('');
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Error al procesar compra:", err);
      setError(err.response?.data?.mensaje || "Error al procesar el pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-xl font-semibold text-gray-500 animate-pulse">Cargando módulo de compras...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-200">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-800">Registrar Compra</h2>
          <p className="text-gray-500 font-medium">Entrada de mercancía al almacén.</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 flex items-center shadow-sm rounded-r-xl animate-in fade-in">
          <CheckCircle className="text-emerald-500 mr-3" />
          <div>
            <p className="text-emerald-800 font-bold">¡Compra registrada con éxito!</p>
            <p className="text-emerald-600 text-sm">El stock ha sido actualizado automáticamente.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start shadow-sm rounded-r-xl animate-in shake">
          <AlertCircle className="text-red-500 mr-3 mt-0.5" />
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Proveedor */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
            <Truck className="w-4 h-4 mr-2" />
            Proveedor
          </label>
          <select
            className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all font-bold text-gray-700"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            required
          >
            <option value="">Selecciona un proveedor...</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        {/* Detalles del Pedido */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-800 flex items-center">
              <Package className="w-6 h-6 mr-2 text-emerald-600" />
              Productos a Pedir
            </h3>
            <button
              type="button"
              onClick={agregarLinea}
              className="flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4 mr-1" />
              Añadir Línea
            </button>
          </div>

          <div className="space-y-4">
            {detalles.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Tu pedido está vacío.</p>
                <p className="text-sm">Pulsa "Añadir Línea" para comenzar.</p>
              </div>
            ) : (
              detalles.map((linea, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-2xl group transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-100 border border-transparent hover:border-gray-100">
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Producto</label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
                      value={linea.productoId}
                      onChange={(e) => actualizarLinea(index, 'productoId', e.target.value)}
                      required
                    >
                      <option value="">Selecciona...</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-5 md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Cant.</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-center"
                      value={linea.cantidad}
                      onChange={(e) => actualizarLinea(index, 'cantidad', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Costo Unit.</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-right"
                        value={linea.precioUnitario}
                        onChange={(e) => actualizarLinea(index, 'precioUnitario', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => eliminarLinea(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-end">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Total Estimado</p>
            <p className="text-4xl font-black text-gray-800 mt-1">
              ${calcularTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || detalles.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-[2rem] shadow-xl shadow-emerald-200 transition-all flex justify-center items-center text-lg disabled:bg-gray-300 disabled:shadow-none group"
        >
          {submitting ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Procesando Pedido...
            </>
          ) : (
            <>
              Confirmar Compra
              <CheckCircle className="w-6 h-6 ml-2 group-hover:scale-110 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Compras;
