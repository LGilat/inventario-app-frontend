import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, AlertCircle, Clock, ChevronRight, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    productos: 0,
    clientes: 0,
    ventas: 0,
    totalVentas: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resProd, resCli, resVen] = await Promise.all([
        api.get('/producto'),
        api.get('/cliente'),
        api.get('/venta')
      ]);

      const productos = resProd.data.items || [];
      const clientes = resCli.data.items || [];
      const ventas = resVen.data.items || (Array.isArray(resVen.data) ? resVen.data : []);

      setStats({
        productos: productos.length,
        clientes: clientes.length,
        ventas: ventas.length,
        totalVentas: ventas.reduce((acc, curr) => acc + (curr.total || 0), 0)
      });

      // 1. Datos para gráfico de barras (Ventas últimos 7 días)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const salesByDay = last7Days.map(day => {
        const total = ventas
          .filter(v => v.fechaVenta.startsWith(day))
          .reduce((sum, v) => sum + v.total, 0);
        return { 
          name: new Date(day).toLocaleDateString('es-ES', { weekday: 'short' }), 
          total 
        };
      });
      setChartData(salesByDay);

      // 2. Datos para gráfico de tarta (Productos por categoría)
      const categories = [...new Set(productos.map(p => p.categoria))];
      const categoryCounts = categories.map(cat => ({
        name: cat,
        value: productos.filter(p => p.categoria === cat).length
      }));
      setPieData(categoryCounts);

      // 3. Últimas 5 ventas
      const sortedVentas = [...ventas].sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta));
      setRecentSales(sortedVentas.slice(0, 5));

      setError(null);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { name: 'Productos', value: stats.productos, icon: Package, color: 'bg-indigo-600', shadow: 'shadow-indigo-200' },
    { name: 'Clientes', value: stats.clientes, icon: Users, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
    { name: 'Ventas Totales', value: stats.ventas, icon: ShoppingCart, color: 'bg-rose-600', shadow: 'shadow-rose-200' },
    { name: 'Ingresos Totales', value: `$${stats.totalVentas.toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
  ];

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-400 font-bold animate-pulse text-xl">Generando análisis empresarial...</div>;

  return (
    <div className="space-y-10 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-800 tracking-tight">Análisis General</h2>
          <p className="text-gray-500 font-medium mt-1">Métricas clave de rendimiento.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          <span className="text-sm font-black text-gray-700">ACTUALIZADO EN VIVO</span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card) => (
          <div key={card.name} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all">
            <div className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${card.shadow}`}>
              <card.icon className="w-7 h-7" />
            </div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{card.name}</p>
            <p className="text-3xl font-black text-gray-800 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-indigo-600" />
            Ventas de la Semana
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800}}
                />
                <Bar dataKey="total" fill="#4f46e5" radius={[8, 8, 8, 8]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center">
            <Package className="w-6 h-6 mr-3 text-emerald-600" />
            Stock por Categoría
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', fontWeight: 800}} />
                <Legend iconType="circle" wrapperStyle={{fontWeight: 700, fontSize: 12, paddingTop: 20}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla Ventas Recientes */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-gray-800">Últimas Operaciones</h3>
          <Link to="/ventas" className="text-sm font-black text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-2xl hover:bg-indigo-100 transition-all">Ver Historial Completo</Link>
        </div>
        <div className="space-y-4">
          {recentSales.map((venta) => (
            <div key={venta.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  #{venta.id}
                </div>
                <div>
                  <p className="font-black text-gray-800">{venta.cliente?.nombre || 'Cliente Final'}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    {new Date(venta.fechaVenta).toLocaleDateString()} • {venta.detalleVenta?.length || 0} productos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gray-800">${venta.total.toLocaleString()}</p>
                <p className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">ÉXITO</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
