import React, { useState, useEffect } from 'react';
import { Box, AlertTriangle, CheckCircle, Search, MapPin, Package, RefreshCw, Filter, Edit3, X, Save, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../api/axios';

const Stock = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Inventario Mensual');

  const LOW_STOCK_THRESHOLD = 10;
  const CRITICAL_STOCK_THRESHOLD = 5;

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stock');
      setStock(response.data.items || []);
      setError(null);
    } catch (err) {
      setError("Error al cargar el stock.");
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Producto", "Ubicación", "Cantidad", "Estado"];
    const tableRows = [];

    filteredStock.forEach(item => {
      const status = getStockStatus(item.cantidad).label;
      const rowData = [
        item.id,
        item.producto?.nombre,
        item.ubicacion,
        item.cantidad,
        status
      ];
      tableRows.push(rowData);
    });

    doc.setFontSize(18);
    doc.text("Reporte de Inventario de Almacén", 14, 22);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 30);
    
    doc.autoTable(tableColumn, tableRows, { startY: 40 });
    doc.save(`reporte-stock-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleAdjust = (item) => {
    setSelectedItem(item);
    setNewQuantity(item.cantidad);
    setShowModal(true);
  };

  const submitAdjustment = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/stock/${selectedItem.id}`, {
        cantidad: newQuantity,
        motivo: adjustmentReason
      });
      setShowModal(false);
      fetchStock();
    } catch (err) {
      setError("Error al ajustar stock.");
    }
  };

  const getStockStatus = (cantidad) => {
    if (cantidad <= CRITICAL_STOCK_THRESHOLD) return { label: 'Crítico', color: 'text-red-700 bg-red-100 border-red-200', icon: AlertTriangle };
    if (cantidad <= LOW_STOCK_THRESHOLD) return { label: 'Bajo', color: 'text-orange-700 bg-orange-100 border-orange-200', icon: AlertTriangle };
    return { label: 'Suficiente', color: 'text-emerald-700 bg-emerald-100 border-emerald-200', icon: CheckCircle };
  };

  const filteredStock = stock.filter(item => {
    const matchesSearch = item.producto?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const isCritical = item.cantidad <= CRITICAL_STOCK_THRESHOLD;
    const isLow = item.cantidad <= LOW_STOCK_THRESHOLD && item.cantidad > CRITICAL_STOCK_THRESHOLD;

    if (filterType === 'critical') return matchesSearch && isCritical;
    if (filterType === 'low') return matchesSearch && (isLow || isCritical);
    return matchesSearch;
  });

  const countCritical = stock.filter(i => i.cantidad <= CRITICAL_STOCK_THRESHOLD).length;
  const countLow = stock.filter(i => i.cantidad <= LOW_STOCK_THRESHOLD).length;

  if (loading) return <div className="flex justify-center items-center h-64 text-xl font-black text-gray-400 animate-pulse uppercase tracking-[0.2em]">Sincronizando Almacén...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 flex items-center">
            <Box className="w-8 h-8 mr-3 text-indigo-600" />
            Almacén Real
          </h2>
          <p className="text-gray-500 font-medium mt-1">Niveles de stock y alertas operativas.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportToPDF}
            className="flex items-center bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl transition-all font-black text-sm shadow-xl shadow-gray-100 group"
          >
            <Download className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform" />
            PDF REPORTE
          </button>
          <button 
            onClick={fetchStock}
            className="p-3 bg-white border border-gray-100 hover:bg-gray-50 text-gray-700 rounded-2xl transition-all shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por producto o ubicación..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button onClick={() => setFilterType('all')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${filterType === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>TODOS</button>
          <button onClick={() => setFilterType('low')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center ${filterType === 'low' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-gray-400 hover:text-gray-600'}`}>BAJO ({countLow})</button>
          <button onClick={() => setFilterType('critical')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center ${filterType === 'critical' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-gray-400 hover:text-gray-600'}`}>CRÍTICO ({countCritical})</button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-8">Producto</th>
                <th className="px-10 py-8 text-center">Cantidad</th>
                <th className="px-10 py-8">Estado</th>
                <th className="px-10 py-8 text-right">Ajuste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStock.map((item) => {
                const status = getStockStatus(item.cantidad);
                const StatusIcon = status.icon;
                return (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-10 py-10">
                      <div className="flex items-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shadow-sm ${item.cantidad <= LOW_STOCK_THRESHOLD ? 'bg-orange-50 text-orange-500 border border-orange-100' : 'bg-indigo-50 text-indigo-500 border border-indigo-100'}`}>
                          <Package className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-xl leading-tight">{item.producto?.nombre}</p>
                          <p className="text-[10px] text-gray-400 font-black mt-1 flex items-center uppercase tracking-widest">
                            <MapPin className="w-3 h-3 mr-1 text-gray-300" /> {item.ubicacion}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-center">
                      <span className={`text-4xl font-black tracking-tighter ${item.cantidad <= CRITICAL_STOCK_THRESHOLD ? 'text-red-600' : item.cantidad <= LOW_STOCK_THRESHOLD ? 'text-orange-600' : 'text-gray-800'}`}>
                        {item.cantidad}
                      </span>
                    </td>
                    <td className="px-10 py-10">
                      <span className={`inline-flex items-center px-5 py-2 rounded-2xl text-[10px] font-black border uppercase tracking-widest ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5 mr-2" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <button 
                        onClick={() => handleAdjust(item)}
                        className="p-4 bg-gray-50 text-gray-300 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm group"
                        title="Ajuste manual"
                      >
                        <Edit3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="bg-indigo-600 p-12 text-white relative">
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mb-6"><Edit3 className="w-10 h-10" /></div>
              <h3 className="text-4xl font-black">Ajuste Manual</h3>
              <p className="text-indigo-100 font-bold mt-2">Producto: <span className="text-white underline">{selectedItem?.producto?.nombre}</span></p>
            </div>
            <form onSubmit={submitAdjustment} className="p-12 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Stock Actual</label>
                  <div className="bg-gray-100 px-8 py-5 rounded-3xl font-black text-3xl text-gray-400">{selectedItem?.cantidad}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Nueva Cantidad</label>
                  <input type="number" min="0" className="w-full bg-indigo-50 border-4 border-indigo-100 px-8 py-5 rounded-3xl font-black text-3xl text-indigo-600 focus:border-indigo-500 focus:outline-none transition-all" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Justificación</label>
                <select className="w-full bg-gray-50 border-4 border-gray-100 px-8 py-5 rounded-3xl font-black text-gray-700 focus:border-indigo-500 focus:outline-none transition-all appearance-none" value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)}>
                  <option value="Inventario Mensual">Inventario Mensual</option>
                  <option value="Rotura / Pérdida">Rotura / Pérdida</option>
                  <option value="Error de entrada">Error de entrada</option>
                  <option value="Devolución">Devolución</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center text-xl group">
                <Save className="w-7 h-7 mr-4 group-hover:scale-110 transition-transform" /> GUARDAR AJUSTE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
