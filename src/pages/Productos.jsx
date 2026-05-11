import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Trash2, Edit2, AlertCircle, X, Save, Tag, Layers } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Formulario nuevo producto
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precioCompra: '',
    precioVenta: ''
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    if (location.state?.openNew === 'producto') {
      setShowModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/producto');
      setProductos(response.data.items || []);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const dataToSend = {
        ...formData,
        precioCompra: parseFloat(formData.precioCompra),
        precioVenta: parseFloat(formData.precioVenta)
      };

      await api.post('/producto', dataToSend);
      setSuccess(true);
      setFormData({ nombre: '', descripcion: '', categoria: '', precioCompra: '', precioVenta: '' });
      setShowModal(false);
      fetchProductos();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "Error al crear el producto.");
    }
  };

  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64 text-xl font-black text-gray-400 animate-pulse tracking-widest uppercase">Cargando Catálogo...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-800 tracking-tight">Catálogo de Productos</h2>
          <p className="text-gray-500 font-medium mt-1">Gestiona los precios y categorías de tus artículos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[1.5rem] transition-all font-black shadow-xl shadow-indigo-100 group"
        >
          <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform" />
          AÑADIR PRODUCTO
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
          <p className="text-emerald-700 font-black flex items-center">
            <Tag className="w-5 h-5 mr-2" /> PRODUCTO REGISTRADO CORRECTAMENTE
          </p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-r-2xl shadow-sm">
          <p className="text-rose-700 font-black flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" /> {error}
          </p>
        </div>
      )}

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Filtrar por nombre o categoría..."
          className="block w-full pl-14 pr-6 py-4.5 border-none rounded-[2rem] bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm text-gray-700 font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-8">Producto</th>
                <th className="px-10 py-8">Categoría</th>
                <th className="px-10 py-8">Precios</th>
                <th className="px-10 py-8">Margen</th>
                <th className="px-10 py-8 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProductos.length > 0 ? (
                filteredProductos.map((prod) => {
                  const margen = prod.precioVenta - prod.precioCompra;
                  const pctMargen = ((margen / prod.precioCompra) * 100).toFixed(0);
                  return (
                    <tr key={prod.id} className="hover:bg-indigo-50/30 transition-all group">
                      <td className="px-10 py-10">
                        <div className="flex items-center">
                          <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center mr-5 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Package className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-xl leading-tight">{prod.nombre}</p>
                            <p className="text-xs text-gray-400 font-bold mt-1 max-w-xs truncate">{prod.descripcion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-sm">
                        <span className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full font-black text-[10px] uppercase tracking-widest border border-gray-200">
                          {prod.categoria}
                        </span>
                      </td>
                      <td className="px-10 py-10">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-400 line-through">${prod.precioCompra.toFixed(2)}</span>
                          <span className="text-2xl font-black text-indigo-600 tracking-tighter">${prod.precioVenta.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <div className={`inline-flex items-center font-black text-xs ${margen > 0 ? 'text-emerald-500 bg-emerald-50 border border-emerald-100' : 'text-rose-500 bg-rose-50 border border-rose-100'} px-3 py-1 rounded-lg`}>
                          +{pctMargen}%
                        </div>
                      </td>
                      <td className="px-10 py-10 text-right">
                        <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm"><Edit2 className="w-5 h-5" /></button>
                          <button className="p-3 text-gray-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="5" className="px-10 py-20 text-center text-gray-300 font-bold italic tracking-widest uppercase">Sin resultados en el catálogo</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NUEVO PRODUCTO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden transform animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="bg-indigo-600 p-12 text-white relative">
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mb-6"><Package className="w-10 h-10" /></div>
              <h3 className="text-4xl font-black">Nuevo Producto</h3>
              <p className="text-indigo-100 font-bold mt-2">Introduce los datos para el catálogo general.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Tag className="w-3 h-3 mr-2" /> Nombre del Producto</label>
                  <input type="text" name="nombre" className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white px-6 py-4 rounded-2xl font-bold text-gray-700 focus:outline-none transition-all" value={formData.nombre} onChange={handleInputChange} required placeholder="Ej: Monitor UltraWide 34\" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Descripción Detallada</label>
                  <textarea name="descripcion" rows="2" className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white px-6 py-4 rounded-2xl font-bold text-gray-700 focus:outline-none transition-all" value={formData.descripcion} onChange={handleInputChange} required placeholder="Especificaciones técnicas..."></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Layers className="w-3 h-3 mr-2" /> Categoría</label>
                  <input type="text" name="categoria" className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white px-6 py-4 rounded-2xl font-bold text-gray-700 focus:outline-none transition-all" value={formData.categoria} onChange={handleInputChange} required placeholder="Ej: Periféricos" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Costo ($)</label>
                    <input type="number" step="0.01" name="precioCompra" className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white px-6 py-4 rounded-2xl font-bold text-gray-700 focus:outline-none transition-all" value={formData.precioCompra} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Venta ($)</label>
                    <input type="number" step="0.01" name="precioVenta" className="w-full bg-indigo-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white px-6 py-4 rounded-2xl font-black text-indigo-600 focus:outline-none transition-all" value={formData.precioVenta} onChange={handleInputChange} required />
                  </div>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center text-xl group">
                <Save className="w-7 h-7 mr-4 group-hover:scale-110 transition-transform" /> REGISTRAR EN CATÁLOGO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;
