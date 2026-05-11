import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Mail, MapPin, AlertCircle, X, Save, Phone, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Formulario nuevo proveedor
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    direccion: ''
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  useEffect(() => {
    if (location.state?.openNew === 'proveedor') {
      setShowModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/proveedor');
      setProveedores(response.data.items || []);
      setError(null);
    } catch (err) {
      setError("Error al cargar proveedores.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await api.post('/proveedor', formData);
      setSuccess(true);
      setFormData({ nombre: '', contacto: '', direccion: '' });
      setShowModal(false);
      fetchProveedores();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al crear el proveedor.");
    }
  };

  const filtered = proveedores.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64 text-xl font-black text-gray-400 animate-pulse tracking-widest uppercase">Cargando Socios...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-800 tracking-tight">Proveedores Globales</h2>
          <p className="text-gray-500 font-medium mt-1">Directorio de socios comerciales y logística.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-[1.5rem] transition-all font-black shadow-xl shadow-emerald-100 group"
        >
          <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform" />
          NUEVO PROVEEDOR
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-2xl shadow-sm">
          <p className="text-emerald-700 font-black">PROVEEDOR REGISTRADO CON ÉXITO</p>
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
          <Search className="h-6 w-6 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, email o dirección..."
          className="block w-full pl-14 pr-6 py-4.5 border-none rounded-[2rem] bg-white focus:outline-none focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm text-gray-700 font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((prov) => (
          <div key={prov.id} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-gray-200 hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 opacity-50 rounded-bl-full transform translate-x-12 -translate-y-12"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm shadow-emerald-100">
                <Truck className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-black text-gray-300 tracking-[0.2em]">ID PROV: #{prov.id}</span>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-6 group-hover:text-emerald-600 transition-colors">{prov.nombre}</h3>
            <div className="space-y-4">
              <div className="flex items-center text-sm font-bold text-gray-500 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <Mail className="w-4 h-4 mr-3 text-emerald-500" />
                {prov.contacto}
              </div>
              <div className="flex items-center text-sm font-bold text-gray-500 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <MapPin className="w-4 h-4 mr-3 text-rose-500" />
                {prov.direccion}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL NUEVO PROVEEDOR */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="bg-emerald-600 p-12 text-white relative">
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mb-6"><Truck className="w-10 h-10" /></div>
              <h3 className="text-4xl font-black">Nuevo Proveedor</h3>
              <p className="text-emerald-100 font-bold mt-2">Registra un nuevo socio comercial en el sistema.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><User className="w-3 h-3 mr-2" /> Nombre de Empresa / Social</label>
                <input type="text" name="nombre" className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white px-6 py-4 rounded-2xl font-bold text-gray-700 focus:outline-none transition-all" value={formData.nombre} onChange={handleInputChange} required placeholder="Ej: Tech Suministros S.L." />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Phone className="w-3 h-3 mr-2" /> Contacto Principal</label>
                <input type="text" name="contacto" className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white px-6 py-4 rounded-2xl font-bold text-gray-700 focus:outline-none transition-all" value={formData.contacto} onChange={handleInputChange} required placeholder="Email o Teléfono" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><MapPin className="w-3 h-3 mr-2" /> Dirección de Sede</label>
                <input type="text" name="direccion" className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white px-6 py-4 rounded-2xl font-bold text-gray-700 focus:outline-none transition-all" value={formData.direccion} onChange={handleInputChange} required placeholder="Calle, Ciudad, CP" />
              </div>
              
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-emerald-100 transition-all flex items-center justify-center text-xl group">
                <Save className="w-7 h-7 mr-4 group-hover:scale-110 transition-transform" /> GUARDAR PROVEEDOR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
