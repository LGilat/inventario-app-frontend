import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, MapPin, Phone, Trash2, Edit2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Formulario nuevo cliente
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    direccion: ''
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (location.state?.openNew === 'cliente') {
      setShowModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cliente');
      setClientes(response.data.items || (Array.isArray(response.data) ? response.data : []));
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los clientes.");
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
      await api.post('/cliente', formData);
      setSuccess(true);
      setFormData({ nombre: '', contacto: '', direccion: '' });
      setShowModal(false);
      fetchClientes();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Error al crear el cliente.");
    }
  };

  const filtered = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64 text-xl font-semibold text-gray-500">Cargando clientes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <Users className="w-8 h-8 mr-3 text-blue-600" />
          Clientes
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registrar Cliente
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center shadow-sm rounded-r-lg">
          <CheckCircle className="text-green-500 mr-3" />
          <p className="text-green-700 font-medium">Cliente registrado con éxito.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center shadow-sm rounded-r-lg">
          <AlertCircle className="text-red-500 mr-3" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o contacto..."
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cliente) => (
          <div key={cliente.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
                {cliente.nombre.charAt(0)}
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">{cliente.nombre}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <Phone className="w-4 h-4 mr-3 text-blue-500" />
                {cliente.contacto}
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <MapPin className="w-4 h-4 mr-3 text-red-500" />
                {cliente.direccion}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
              <span>Nº CLIENTE: #{cliente.id}</span>
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>
                Activo
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para Nuevo Cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Nuevo Cliente</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Contacto (Email/Tel)</label>
                <input
                  type="text"
                  name="contacto"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Ej: 600123456 o email@ejemplo.com"
                  value={formData.contacto}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Ej: Calle Gran Vía 12"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
