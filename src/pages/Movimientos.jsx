import React, { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, ArrowRightLeft, Calendar, Package, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/movimientos');
      setMovimientos(response.data.items || []);
      setError(null);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
      setError("No se pudieron cargar los movimientos de stock.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-xl font-semibold text-gray-500">Cargando historial...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <History className="w-8 h-8 mr-3 text-purple-600" />
          Historial de Movimientos
        </h2>
        <div className="flex space-x-3">
          <span className="flex items-center text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Entradas
          </span>
          <span className="flex items-center text-xs font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
            <TrendingDown className="w-3.5 h-3.5 mr-1.5" /> Salidas (Ventas)
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 flex items-start shadow-sm">
          <AlertCircle className="text-red-500 mr-3 mt-0.5" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-500 font-bold text-xs uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5 border-b">Fecha y Hora</th>
                <th className="px-8 py-5 border-b">Producto</th>
                <th className="px-8 py-5 border-b">Tipo</th>
                <th className="px-8 py-5 border-b text-center">Cantidad</th>
                <th className="px-8 py-5 border-b">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {movimientos.length > 0 ? (
                movimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-medium text-gray-600">{formatDate(mov.fechaMovimiento)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                          <Package className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-800">{mov.producto?.nombre || 'Producto Desconocido'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        mov.tipoMovimiento === 'Salida' 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {mov.tipoMovimiento === 'Salida' ? (
                          <TrendingDown className="w-3 h-3 mr-1.5" />
                        ) : (
                          <TrendingUp className="w-3 h-3 mr-1.5" />
                        )}
                        {mov.tipoMovimiento}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-lg font-black ${
                        mov.tipoMovimiento === 'Salida' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {mov.tipoMovimiento === 'Salida' ? '-' : '+'}{Math.abs(mov.cantidad)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-xs font-semibold text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-sm shadow-green-200"></div>
                        Completado
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <ArrowRightLeft className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-gray-400 font-medium italic">No se registran movimientos aún.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Movimientos;
